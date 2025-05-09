"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calendar, DollarSign, TrendingUp, Users } from 'lucide-react'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { saleService } from "@/services/saleService"
import { productService } from "@/services/productService"
import { clientService } from "@/services/clientService"

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeframe, setTimeframe] = useState("month") // week, month, year
  
  // Analytics data
  const [salesData, setSalesData] = useState<any[]>([])
  const [productPerformance, setProductPerformance] = useState<any[]>([])
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([])
  const [clientDistribution, setClientDistribution] = useState<any[]>([])
  
  // Summary metrics
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [averageOrderValue, setAverageOrderValue] = useState(0)
  const [salesGrowth, setSalesGrowth] = useState(0)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        
        // Fetch sales data
        const salesResponse = await saleService.getSales()
        const sales = salesResponse.data
        
        // Fetch products data
        const productsResponse = await productService.getProducts()
        const products = productsResponse.data
        
        // Fetch clients data
        const clientsResponse = await clientService.getClients()
        const clients = clientsResponse.data
        
        // Process data for analytics
        processData(sales, products, clients)
        
        setLoading(false)
      } catch (err: any) {
        setError(err.message || "Failed to fetch analytics data")
        setLoading(false)
      }
    }
    
    fetchAnalyticsData()
  }, [timeframe])
  
  const processData = (sales: any[], products: any[], clients: any[]) => {
    // Skip processing if no data
    if (!sales.length) return
    
    // Filter sales based on timeframe
    const filteredSales = filterSalesByTimeframe(sales, timeframe)
    
    // Calculate summary metrics
    calculateSummaryMetrics(filteredSales)
    
    // Process sales data for charts
    processSalesData(filteredSales)
    
    // Process product performance
    processProductPerformance(filteredSales, products)
    
    // Process category distribution
    processCategoryDistribution(products)
    
    // Process client distribution
    processClientDistribution(filteredSales, clients)
  }
  
  const filterSalesByTimeframe = (sales: any[], timeframe: string) => {
    const now = new Date()
    let startDate: Date
    
    switch(timeframe) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    }
    
    return sales.filter(sale => new Date(sale.createdAt) >= startDate)
  }
  
  const calculateSummaryMetrics = (sales: any[]) => {
    // Total revenue
    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    setTotalRevenue(revenue)
    
    // Total profit
    const profit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0)
    setTotalProfit(profit)
    
    // Average order value
    const aov = sales.length ? revenue / sales.length : 0
    setAverageOrderValue(aov)
    
    // Sales growth (mock data for now)
    // In a real app, you'd compare current period to previous period
    setSalesGrowth(12.5)
  }
  
  const processSalesData = (sales: any[]) => {
    // Group sales by date
    const salesByDate = sales.reduce((acc: any, sale: any) => {
      const date = new Date(sale.createdAt)
      let key: string
      
      if (timeframe === "week") {
        key = date.toLocaleDateString('en-US', { weekday: 'short' })
      } else if (timeframe === "month") {
        key = date.toLocaleDateString('en-US', { day: '2-digit' })
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short' })
      }
      
      if (!acc[key]) {
        acc[key] = {
          date: key,
          revenue: 0,
          profit: 0,
          orders: 0
        }
      }
      
      acc[key].revenue += sale.total
      acc[key].profit += (sale.profit || 0)
      acc[key].orders += 1
      
      return acc
    }, {})
    
    // Convert to array and sort
    const salesDataArray = Object.values(salesByDate)
    setSalesData(salesDataArray)
  }
  
  const processProductPerformance = (sales: any[], products: any[]) => {
    // Create a map of product quantities sold
    const productQuantities: Record<string, number> = {}
    const productRevenue: Record<string, number> = {}
    
    sales.forEach(sale => {
      sale.items.forEach((item: any) => {
        const productId = item.productId.toString()
        
        if (!productQuantities[productId]) {
          productQuantities[productId] = 0
          productRevenue[productId] = 0
        }
        
        productQuantities[productId] += item.quantity
        productRevenue[productId] += item.subtotal
      })
    })
    
    // Map to product names and create data array
    const productPerformanceData = products
      .filter(product => productQuantities[product._id?.toString() || ""])
      .map(product => ({
        name: product.name,
        quantity: productQuantities[product._id?.toString() || ""] || 0,
        revenue: productRevenue[product._id?.toString() || ""] || 0
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5) // Top 5 products
    
    setProductPerformance(productPerformanceData)
  }
  
  const processCategoryDistribution = (products: any[]) => {
    // Group products by category
    const categories = products.reduce((acc: any, product: any) => {
      const category = product.category
      
      if (!acc[category]) {
        acc[category] = {
          name: category,
          count: 0,
          value: 0 // For pie chart
        }
      }
      
      acc[category].count += 1
      acc[category].value += 1
      
      return acc
    }, {})
    
    // Convert to array
    const categoryData = Object.values(categories)
    setCategoryDistribution(categoryData)
  }
  
  const processClientDistribution = (sales: any[], clients: any[]) => {
    // Create a map of client purchases
    const clientPurchases: Record<string, number> = {}
    
    sales.forEach(sale => {
      const clientId = sale.clientId.toString()
      
      if (!clientPurchases[clientId]) {
        clientPurchases[clientId] = 0
      }
      
      clientPurchases[clientId] += sale.total
    })
    
    // Map to client names and create data array
    const clientData = clients
      .filter(client => clientPurchases[client._id?.toString() || ""])
      .map(client => ({
        name: client.name,
        value: clientPurchases[client._id?.toString() || ""] || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 clients
    
    setClientDistribution(clientData)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analytics data..." />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
        <p className="text-gray-600 mt-1">Gain insights into your business performance</p>
      </div>
      
      {/* Timeframe selector */}
      <div className="mb-6 flex justify-end">
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
        
        {/* Profit */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Profit</h3>
            <span className="bg-green-100 text-green-800 p-2 rounded-full">
              <DollarSign className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">${totalProfit.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Average Order Value</h3>
            <span className="bg-purple-100 text-purple-800 p-2 rounded-full">
              <Calendar className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">${averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Growth */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Sales Growth</h3>
            <span className="bg-yellow-100 text-yellow-800 p-2 rounded-full">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{salesGrowth}%</p>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
          <div className="h-80">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
                  <Bar dataKey="profit" name="Profit" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No sales data available for this period</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
          <div className="h-80">
            {productPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productPerformance}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" name="Units Sold" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No product data available for this period</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Categories</h3>
          <div className="h-80">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Top Clients */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Clients</h3>
          <div className="h-80">
            {clientDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No client data available for this period</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
