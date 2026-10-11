import {
  FurnitureObject,
  CompletenessReport,
  getSectionParameters,
  getWalls,
  getTechnicalPoints,
  getAppliances,
  getOpenings
} from '../types/furnitureObject';
import { Measurement } from '../types/measurement';
import { getTemplateForType } from '../templates/registry';

export function evaluateObjectCompleteness(object: FurnitureObject): CompletenessReport {
  const template = getTemplateForType(object.objectTypeId);
  const missing: string[] = [];
  const warnings: string[] = [];
  const ok: string[] = [];

  let totalWeight = 0;
  let earnedScore = 0;

  for (const section of template.sections) {
    totalWeight += section.weight;

    if (section.kind === 'parameters' && section.fields) {
      const params = getSectionParameters<Record<string, unknown>>(object, section.id);
      const requiredFields = section.fields.filter(f => f.required);
      
      if (requiredFields.length > 0) {
        let satisfied = 0;
        for (const f of requiredFields) {
          const val = params[f.id];
          if (val !== undefined && val !== null && val !== '') {
            satisfied++;
            if (f.id === 'ceiling_height_mm') {
              ok.push(`Ceiling height recorded: ${val} mm`);
            }
          } else {
            missing.push(`${f.label} is required`);
          }
        }
        earnedScore += section.weight * (satisfied / requiredFields.length);
      } else {
        // No strictly required parameters
        const hasAnyParam = Object.values(params).some(v => v !== undefined && v !== '');
        earnedScore += section.weight * (hasAnyParam ? 1 : 0.8);
      }
    } else if (section.kind === 'collection') {
      const items = object.sections[section.id]?.items || [];
      const minItems = section.minItems || 0;

      if (section.entityType === 'wall') {
        const walls = getWalls(object);
        if (walls.length < minItems) {
          missing.push(`At least ${minItems} wall dimension required`);
        } else {
          ok.push(`${walls.length} wall${walls.length > 1 ? 's' : ''} recorded`);
          const validWalls = walls.filter(w => w.payload.lengthMm > 0 && w.payload.heightLeftMm > 0);
          earnedScore += section.weight * (validWalls.length / Math.max(1, walls.length));

          // Angle and plumb checks
          walls.forEach(w => {
            const p = w.payload;
            if (p.cornerAngleDeg !== undefined) {
              if (p.cornerAngleDeg < 88.5 || p.cornerAngleDeg > 91.5) {
                warnings.push(
                  `Wall "${p.identifier}" corner angle is ${p.cornerAngleDeg}° (out of square by ${Math.abs(90 - p.cornerAngleDeg).toFixed(1)}°)`
                );
              } else {
                ok.push(`Wall "${p.identifier}" corner angle ${p.cornerAngleDeg}° checked`);
              }
            }
            if (p.plumbDeviationMm && Math.abs(p.plumbDeviationMm) > 8) {
              warnings.push(`Wall "${p.identifier}" has ${Math.abs(p.plumbDeviationMm)}mm vertical plumb deviation`);
            }
          });
        }
      } else if (section.entityType === 'technical_point') {
        const techPoints = getTechnicalPoints(object);
        const requiredTypes = template.completenessRules?.requiredEntityTypes || [];

        if (requiredTypes.length > 0) {
          let matched = 0;
          requiredTypes.forEach(req => {
            const found = techPoints.some(tp => tp.payload.type === req);
            if (found) {
              matched++;
            } else {
              missing.push(`Missing critical utility connection: ${req.replace(/_/g, ' ')}`);
            }
          });
          earnedScore += section.weight * (matched / requiredTypes.length);
        } else {
          earnedScore += section.weight * (techPoints.length > 0 ? 1 : 0.8);
        }

        if (techPoints.length > 0) {
          ok.push(`${techPoints.length} technical utility connections mapped`);
        }
      } else if (section.entityType === 'appliance') {
        const apps = getAppliances(object);
        const requiredApps = template.completenessRules?.requiredAppliances || [];

        if (requiredApps.length > 0) {
          const present = requiredApps.filter(r => apps.some(a => a.payload.type === r));
          earnedScore += section.weight * Math.min(1, present.length / Math.min(3, requiredApps.length));
          if (present.length === 0 && apps.length === 0) {
            warnings.push('No major appliances or fixtures recorded yet');
          } else {
            ok.push(`${apps.length} appliance(s) / fixtures specified`);
          }
        } else {
          earnedScore += section.weight;
        }
      } else if (section.entityType === 'opening') {
        const openings = getOpenings(object);
        earnedScore += section.weight;
        if (openings.length > 0) {
          ok.push(`${openings.length} opening(s) / obstacle(s) mapped`);
        }
      } else {
        earnedScore += section.weight * (items.length >= minItems ? 1 : items.length / Math.max(1, minItems));
      }
    } else if (section.id === 'media') {
      const photosCount = object.media.length;
      if (photosCount < 1) {
        missing.push('At least 1 photo reference required');
        earnedScore += section.weight * 0.3;
      } else {
        earnedScore += section.weight;
        ok.push(`${photosCount} photo(s) attached`);
      }
    } else if (section.id === 'notes') {
      if (object.notes.length > 0) {
        earnedScore += section.weight;
        ok.push('Notes recorded');
      } else {
        earnedScore += section.weight * 0.6;
      }
    }
  }

  const score = totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 100;

  return {
    score: Math.min(100, Math.max(0, score)),
    missing,
    warnings,
    ok
  };
}

export function calculateOverallMeasurementCompleteness(measurement: Measurement): number {
  if (!measurement.objects || measurement.objects.length === 0) return 0;
  const sum = measurement.objects.reduce((acc, obj) => acc + (obj.completeness?.score || 0), 0);
  return Math.round(sum / measurement.objects.length);
}
