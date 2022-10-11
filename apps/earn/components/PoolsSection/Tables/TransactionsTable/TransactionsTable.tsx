import { Pair } from '@sushiswap/graph-client/.graphclient'
import { SortingState } from '@tanstack/react-table'
import React, { FC, useEffect, useState } from 'react'

import { getPoolTransactions } from '../../../../lib/api'

interface TransactionsTableParams {
  pair: Pair
}

export const TransactionsTable: FC<TransactionsTableParams> = ({ pair }) => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'value', desc: true }])

  useEffect(() => {
    let run = true
    const handler = async () => {
      const iterable = await getPoolTransactions(pair.id)

      for await (const value of iterable) {
        if (run) {
          console.log(value)
        } else {
          break
        }
      }
    }

    void handler()

    return () => {
      run = false
    }
  }, [pair.id])

  return <span />
  // const table = useReactTable({
  //   data: data,
  //   state: {
  //     sorting,
  //   },
  //   columns: COLUMNS,
  //   onSortingChange: setSorting,
  //   getCoreRowModel: getCoreRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  // })
  //
  // return (
  //   <GenericTable<UserWithFarm>
  //     table={table}
  //     HoverElement={undefined}
  //     loading={!userWithFarms && isValidating}
  //     placeholder="No Transactions found"
  //     pageSize={Math.max(userWithFarms?.length || 0, 5)}
  //   />
  // )
}
