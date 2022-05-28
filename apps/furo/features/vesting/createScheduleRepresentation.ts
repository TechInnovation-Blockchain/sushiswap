import { Amount, Type } from '@sushiswap/currency'
import { PeriodType } from 'features'

export type Schedule = Period[]
export type Period = {
  id: string
  type: PeriodType
  date: Date
  amount: Amount<Type>
  total: Amount<Type>
}

type CreateScheduleRepresentation = (x: {
  currency: Type
  cliffAmount: Amount<Type> | undefined
  stepAmount: Amount<Type>
  startDate: Date
  cliffEndDate: Date | undefined
  stepPayouts: number
  stepDuration: number
}) => Schedule

export const createScheduleRepresentation: CreateScheduleRepresentation = ({
  currency,
  cliffAmount,
  stepAmount,
  stepDuration,
  startDate,
  cliffEndDate,
  stepPayouts,
}) => {
  let total = Amount.fromRawAmount(currency, '0')
  const periods = [
    {
      id: 'start',
      type: PeriodType.START,
      date: startDate,
      amount: Amount.fromRawAmount(currency, '0'),
      total: Amount.fromRawAmount(currency, '0'),
    },
  ]

  if (cliffEndDate && cliffAmount) {
    total = cliffAmount
    periods.push({
      id: 'cliff',
      type: PeriodType.CLIFF,
      date: cliffEndDate,
      amount: cliffAmount,
      total,
    })
  }

  let time = (cliffEndDate ? cliffEndDate : startDate).getTime()
  for (let i = 0; i < stepPayouts - 1; i++) {
    time += stepDuration
    total = total.add(stepAmount)
    periods.push({
      id: `step:${i}`,
      type: PeriodType.STEP,
      date: new Date(time),
      amount: stepAmount,
      total,
    })
  }

  time += stepDuration
  total = total.add(stepAmount)
  periods.push({
    id: 'end',
    type: PeriodType.END,
    date: new Date(time),
    amount: stepAmount,
    total,
  })

  return periods
}