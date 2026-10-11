import { Room, RoomCompletenessReport } from '../types/spatial';

export function evaluateRoomCompleteness(room: Room): RoomCompletenessReport {
  const missing: string[] = [];
  const warnings: string[] = [];
  const completed: string[] = [];

  let score = 0;

  // 1. Walls Check (Weight: 35%)
  if (!room.walls || room.walls.length === 0) {
    missing.push('Perimeter walls missing: record at least the main installation walls.');
  } else if (room.walls.length === 1) {
    score += 15;
    warnings.push('Only 1 wall recorded. Add adjacent walls or corner boundaries if enclosed.');
    completed.push(`1 wall captured: ${room.walls[0].identifier} (${room.walls[0].lengthMm} mm)`);
  } else {
    score += 35;
    completed.push(`${room.walls.length} perimeter walls captured with base lengths.`);

    // Quality check: corner angles
    room.walls.forEach(w => {
      if (w.cornerAngleDeg !== undefined) {
        if (w.cornerAngleDeg <= 88.5 || w.cornerAngleDeg >= 91.5) {
          warnings.push(
            `${w.identifier} corner angle is ${w.cornerAngleDeg}° (out of square by ${(
              Math.abs(90 - w.cornerAngleDeg)
            ).toFixed(1)}°). Constructor will need filler strips.`
          );
        }
      }
      if (w.lengthMiddleMm && Math.abs(w.lengthMiddleMm - w.lengthMm) >= 10) {
        warnings.push(
          `${w.identifier} has a ${Math.abs(w.lengthMiddleMm - w.lengthMm)}mm difference between base and middle height (wall bow detected).`
        );
      }
      if (w.plumbDeviationMm && Math.abs(w.plumbDeviationMm) >= 8) {
        warnings.push(
          `${w.identifier} tilts by ${w.plumbDeviationMm}mm over vertical height.`
        );
      }
    });
  }

  // 2. Ceiling Information (Weight: 15%)
  if (!room.ceilingHeightMm || room.ceilingHeightMm <= 0) {
    missing.push('Nominal ceiling height missing.');
  } else {
    score += 15;
    completed.push(`Ceiling height recorded: ${room.ceilingHeightMm} mm.`);
    if (room.ceilingHeightMinMm && room.ceilingHeightMaxMm && room.ceilingHeightMaxMm - room.ceilingHeightMinMm >= 15) {
      warnings.push(
        `Ceiling slopes by ${room.ceilingHeightMaxMm - room.ceilingHeightMinMm}mm (min: ${room.ceilingHeightMinMm}mm, max: ${room.ceilingHeightMaxMm}mm).`
      );
    }
  }

  // 3. Utilities & Feeds Check (Weight: 25%)
  const hasWater = room.utilityPoints.some(u => u.type === 'water_cold' || u.type === 'water_hot');
  const hasDrain = room.utilityPoints.some(u => u.type === 'drain_pipe');
  const hasSockets = room.utilityPoints.some(u => u.type === 'socket_230v' || u.type === 'socket_400v');

  const isKitchen = room.roomType?.toLowerCase().includes('kitchen') || room.name.toLowerCase().includes('kuchn') || room.name.toLowerCase().includes('kitchen');
  const isBathroom = room.roomType?.toLowerCase().includes('bath') || room.name.toLowerCase().includes('łazien') || room.name.toLowerCase().includes('bath');

  if (isKitchen) {
    if (!hasWater) missing.push('Cold/hot water feed not recorded for kitchen.');
    if (!hasDrain) missing.push('Sink drain pipe (waste) not recorded for kitchen.');
    if (!hasSockets) missing.push('Electrical sockets not recorded for kitchen.');

    const hasStovePower = room.utilityPoints.some(u => u.type === 'socket_400v');
    if (!hasStovePower) {
      warnings.push('No 400V stove/cooktop connection marked (verify if induction requires 3-phase).');
    }

    if (hasWater && hasDrain && hasSockets) {
      score += 25;
      completed.push('Critical kitchen feeds captured (Water, Drain, Sockets).');
    } else {
      score += (hasWater ? 8 : 0) + (hasDrain ? 8 : 0) + (hasSockets ? 9 : 0);
    }
  } else if (isBathroom) {
    if (!hasWater) missing.push('Water supply feeds missing.');
    if (!hasDrain) missing.push('Drain connection missing.');
    if (hasWater && hasDrain) {
      score += 25;
      completed.push('Bathroom plumbing feeds recorded.');
    } else {
      score += (hasWater ? 12 : 0) + (hasDrain ? 13 : 0);
    }
  } else {
    // Other rooms (wardrobe, hallway, etc.)
    if (room.utilityPoints.length > 0) {
      score += 25;
      completed.push(`${room.utilityPoints.length} utility points recorded.`);
    } else {
      score += 15; // Not as critical in non-kitchen/bath rooms
      warnings.push('No utility points marked (verify if room contains switches or sockets).');
    }
  }

  // 4. Media & Hand-Drawn Sketches (Weight: 25%)
  const hasPhotos = room.media && room.media.length > 0;
  const hasSketches = room.sketches && room.sketches.length > 0;

  if (hasPhotos && hasSketches) {
    score += 25;
    completed.push(`Documentation verified: ${room.sketches.length} sketch(es) and ${room.media.length} site photo(s) attached.`);
  } else if (hasSketches) {
    score += 20;
    completed.push(`${room.sketches.length} hand-drawn sketch(es) attached.`);
    warnings.push('No contextual room photos attached yet. Taking photos helps CAD designers verify tricky corners.');
  } else if (hasPhotos) {
    score += 15;
    completed.push(`${room.media.length} site photo(s) attached.`);
    warnings.push('No hand-drawn measurement sketch attached.');
  } else {
    missing.push('No photos or sketches attached to verify physical site conditions.');
  }

  // Floor condition note
  if (room.floorCondition === 'raw_screed' || room.floorCondition === 'slanted') {
    warnings.push(`Floor is marked as "${room.floorCondition}". Verify reference datum height before final furniture fabrication.`);
  }

  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    score: normalizedScore,
    isReadyForDesign: normalizedScore >= 70 && missing.length === 0,
    missing,
    warnings,
    completed
  };
}
