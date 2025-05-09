"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ArrowDown, ArrowUp, DollarSign, Filter } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { saleService } from "@/services/saleService"

export default function FinancesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeframe, setTimeframe] = useState("month") // week, month, year
  const [period, setPeriod] = useState("current") // current, previous, year-to-date

  // Financial data
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [expensesData, setExpensesData] = useState<any[]>([])
  const [profitData, setProfitData] = useState<any[]>([])

  // Summary metrics
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [profitMargin, setProfitMargin] = useState(0)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true)

        // Fetch sales data
        const salesResponse = await saleService.getSales()
        const sales = salesResponse.data

        // Process data for financial analysis
        processFinancialData(sales)

        setLoading(false)
      } catch (err: any) {
        setError(err.message || "Failed to fetch financial data")
        setLoading(false)
      }
    }

    fetchFinancialData()
  }, [timeframe, period])

  const processFinancialData = (sales: any[]) => {
    // Skip processing if no data
    if (!sales.length) return

    // Filter sales based on timeframe and period
    const filteredSales = filterSalesByTimeframe(sales, timeframe, period)

    // Calculate summary metrics
    calculateFinancialMetrics(filteredSales)

    // Process revenue data
    processRevenueData(filteredSales)

    // Process expenses data (cost of goods sold)
    processExpensesData(filteredSales)

    // Process profit data
    processProfitData(filteredSales)
  }

  const filterSalesByTimeframe = (sales: any[], timeframe: string, period: string) => {
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    if (period === "current") {
      switch (timeframe) {
        case "week":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
          break
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }
    } else if (period === "previous") {
      switch (timeframe) {
        case "week":
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14)
          break
        case "month":
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          break
        case "year":
          endDate = new Date(now.getFullYear() - 1, 11, 31)
          startDate = new Date(now.getFullYear() - 1, 0, 1)
          break
        default:
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      }
    } else {
      // year-to-date
      startDate = new Date(now.getFullYear(), 0, 1)
    }

    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt)
      return saleDate >= startDate && saleDate <= endDate
    })
  }

  const calculateFinancialMetrics = (sales: any[]) => {
    // Total revenue
    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    setTotalRevenue(revenue)

    // Total expenses (cost of goods sold)
    const expenses = sales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0)
    setTotalExpenses(expenses)

    // Total profit
    const profit = revenue - expenses
    setTotalProfit(profit)

    // Profit margin
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0
    setProfitMargin(margin)
  }

  const processRevenueData = (sales: any[]) => {
    // Group sales by date
    const revenueByDate = sales.reduce((acc: any, sale: any) => {
      const date = new Date(sale.createdAt)
      let key: string

      if (timeframe === "week") {
        key = date.toLocaleDateString("en-US", { weekday: "short" })
      } else if (timeframe === "month") {
        key = date.toLocaleDateString("en-US", { day: "2-digit" })
      } else {
        key = date.toLocaleDateString("en-US", { month: "short" })
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          revenue: 0,
        }
      }

      acc[key].revenue += sale.total

      return acc
    }, {})

    // Convert to array and sort
    const revenueDataArray = Object.values(revenueByDate)
    setRevenueData(revenueDataArray)
  }

  const processExpensesData = (sales: any[]) => {
    // Group expenses by date
    const expensesByDate = sales.reduce((acc: any, sale: any) => {
      const date = new Date(sale.createdAt)
      let key: string

      if (timeframe === "week") {
        key = date.toLocaleDateString("en-US", { weekday: "short" })
      } else if (timeframe === "month") {
        key = date.toLocaleDateString("en-US", { day: "2-digit" })
      } else {
        key = date.toLocaleDateString("en-US", { month: "short" })
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          expenses: 0,
        }
      }

      acc[key].expenses += sale.totalCost || 0

      return acc
    }, {})

    // Convert to array and sort
    const expensesDataArray = Object.values(expensesByDate)
    setExpensesData(expensesDataArray)
  }

  const processProfitData = (sales: any[]) => {
    // Group profit by date
    const profitByDate = sales.reduce((acc: any, sale: any) => {
      const date = new Date(sale.createdAt)
      let key: string

      if (timeframe === "week") {
        key = date.toLocaleDateString("en-US", { weekday: "short" })
      } else if (timeframe === "month") {
        key = date.toLocaleDateString("en-US", { day: "2-digit" })
      } else {
        key = date.toLocaleDateString("en-US", { month: "short" })
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          profit: 0,
        }
      }

      acc[key].profit += sale.profit || sale.total - (sale.totalCost || 0)

      return acc
    }, {})

    // Convert to array and sort
    const profitDataArray = Object.values(profitByDate)
    setProfitData(profitDataArray)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading financial data..." />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
        <p className="text-gray-600 mt-1">Track your business finances and profitability</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setPeriod("current")}
            className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ${
              period === "current"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            }`}
          >
            Current
          </button>
          <button
            type="button"
            onClick={() => setPeriod("previous")}
            className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold ${
              period === "previous"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPeriod("year-to-date")}
            className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ${
              period === "year-to-date"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            }`}
          >
            Year to Date
          </button>
        </div>

        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setTimeframe("week")}
            className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ${
              timeframe === "week"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("month")}
            className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold ${
              timeframe === "month"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("year")}
            className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ${
              timeframe === "year"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <span className="bg-blue-100 text-blue-800 p-2 rounded-full">
              <DollarSign className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Expenses</h3>
            <span className="bg-red-100 text-red-800 p-2 rounded-full">
              <ArrowDown className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Net Profit</h3>
            <span className="bg-green-100 text-green-800 p-2 rounded-full">
              <ArrowUp className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">${totalProfit.toFixed(2)}</p>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Profit Margin</h3>
            <span className="bg-purple-100 text-purple-800 p-2 rounded-full">
              <Filter className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{profitMargin.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* Financial Charts */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Revenue vs Expenses vs Profit */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Overview</h3>
          <div className="h-96">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    allowDuplicatedCategory={false}
                    type="category"
                    domain={revenueData.map((item) => item.date)}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    data={revenueData}
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#0088FE"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    data={expensesData}
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#FF8042"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    data={profitData}
                    dataKey="profit"
                    name="Profit"
                    stroke="#00C49F"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No financial data available for this period</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Statements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Statement */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Income Statement</h3>
          </div>
          <div className="px-6 py-4">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-900">Revenue</td>
                  <td className="py-3 text-sm text-gray-900 text-right">${totalRevenue.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-900">Cost of Goods Sold</td>
                  <td className="py-3 text-sm text-gray-900 text-right">${totalExpenses.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-900">Gross Profit</td>
                  <td className="py-3 text-sm text-gray-900 text-right">${totalProfit.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-900">Operating Expenses</td>
                  <td className="py-3 text-sm text-gray-900 text-right">$0.00</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 text-sm font-bold text-gray-900">Net Profit</td>
                  <td className="py-3 text-sm font-bold text-gray-900 text-right">${totalProfit.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Cash Flow</h3>
          </div>
          <div className="px-6 py-4">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-900">Beginning Balance</td>
                  <td className="py-3 text-sm text-gray-900 text-right">$0.00</td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-900">Cash from Sales</td>
                  <td className="py-3 text-sm text-gray-900 text-right">${totalRevenue.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-900">Cash for Inventory</td>
                  <td className="py-3 text-sm text-gray-900 text-right">-${totalExpenses.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-900">Other Expenses</td>
                  <td className="py-3 text-sm text-gray-900 text-right">-$0.00</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 text-sm font-bold text-gray-900">Ending Balance</td>
                  <td className="py-3 text-sm font-bold text-gray-900 text-right">${totalProfit.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
