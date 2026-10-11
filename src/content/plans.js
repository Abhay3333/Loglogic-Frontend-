export const PLANS = [
  {
    code: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    blurb: 'A small workspace, with no card required.',
    features: [
      '50,000 logs per month',
      '2 seats',
      '3-day retention',
      '1 API key',
      'Polling live tail'
    ]
  },
  {
    code: 'pro',
    name: 'Pro',
    price: '$49',
    period: '/month',
    blurb: 'Production logs, alerts, and a larger team.',
    recommended: true,
    features: [
      '2,000,000 logs per month',
      '$0.10 per extra 10,000 logs',
      '12 seats, then $10 per extra seat',
      '30-day retention',
      '10 API keys',
      'Live tail and alerts'
    ]
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    price: '$299',
    period: '/month',
    blurb: 'Unlimited volume and a year of retention.',
    features: [
      'Unlimited logs',
      'Unlimited seats',
      '365-day retention',
      'Unlimited API keys',
      'Live tail and alerts'
    ]
  }
]

export const PLAN_COMPARISON = [
  ['Logs per period', '50,000', '2,000,000', 'Unlimited'],
  ['Overage', 'Blocked at the cap', '$0.10 / 10,000 logs', 'Included'],
  ['Seats', '2', '12, then $10 each', 'Unlimited'],
  ['Retention', '3 days', '30 days', '365 days'],
  ['API keys', '1', '10', 'Unlimited'],
  ['Live tail', 'Polling', 'Live', 'Live'],
  ['Alerts', 'Off', 'On', 'On']
]
