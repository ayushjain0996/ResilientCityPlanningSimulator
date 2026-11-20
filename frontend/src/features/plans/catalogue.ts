export const USE_CASES = [
  'Phased urban growth planning',
  'Resilience scoring by district',
  'Emergency access design',
  'Critical facility and emergency station siting',
  'Shelter locations and readiness',
  'Smart city sensor placement',
  'Emergency fleet and equipment sizing',
  'Tourism and seasonal population planning',
  'Cross-agency data sharing evaluation',
  'Resource contention and fairness analysis',
  'Evacuation route and road status planning',
  'Staff and vehicle allocation',
] as const

export const ROLES = {
  PLANNER: 'Planner',
  EMERGENCY_SERVICES_MANAGER: 'Emergency Services Manager',
  AUDITOR: 'Auditor',
} as const

export type Role = keyof typeof ROLES
