// frontend/src/components/SummaryCharts.js
import React from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Define a set of colors for chart segments to ensure visual distinction
const COLORS_PIE = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B'];
const COLORS_BAR = { income: '#4CAF50', expense: '#F44336' }; // Green for income, Red for expense

/**
 * Custom Tooltip component for Recharts.
 * @param {object} props - Recharts Tooltip props.
 * @param {Array<object>} props.payload - The data payload for the tooltip.
 * @param {boolean} props.active - Whether the tooltip is active.
 * @param {string} props.label - The label for the tooltip.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md text-gray-900 dark:text-gray-100">
        <p className="font-bold text-lg mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: $${entry.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Component to display financial insights using Recharts.
 * Includes a Pie Chart for expenses by category and a Bar Chart for monthly income vs. expenses.
 * @param {object} props - Component props.
 * @param {Array<object>} props.transactions - Array of transaction objects to analyze.
 */
function SummaryCharts({ transactions }) {
  // Prepare data for the Pie Chart: Aggregate expenses by category
  const expenseCategories = transactions
    .filter(t => t.type === 'expense') // Only consider expense transactions
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount; // Sum amounts for each category
      return acc;
    }, {});

  // Convert the aggregated data into an array of objects suitable for Recharts PieChart
  const pieChartData = Object.keys(expenseCategories).map(category => ({
    name: category,
    value: expenseCategories[category],
  }));

  // Prepare data for the Bar Chart: Calculate total income and expenses
  const monthlyData = [
    { name: 'Income', value: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) },
    { name: 'Expenses', value: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Expenses by Category Pie Chart Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">Expenses by Category</h3>
        {pieChartData.length > 0 && pieChartData.some(data => data.value > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%" // Center X position
                cy="50%" // Center Y position
                labelLine={false} // Do not show connecting lines for labels
                outerRadius={100} // Radius of the outer arc
                fill="#8884d8" // Default fill color
                dataKey="value" // Key to read data values from
                // Custom label function to display category name and percentage
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {/* Map colors to each slice of the pie chart */}
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                ))}
              </Pie>
              {/* Tooltip to show exact values on hover */}
              <Tooltip content={<CustomTooltip />} />
              <Legend /> {/* Legend to identify categories */}
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No expense data to display.</p>
        )}
      </div>

      {/* Monthly Income vs. Expenses Bar Chart Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">Monthly Income vs. Expenses</h3>
        {monthlyData[0].value > 0 || monthlyData[1].value > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke="#666" className="dark:text-gray-300" /> {/* X-axis for Income/Expenses labels */}
              <YAxis stroke="#666" className="dark:text-gray-300" /> {/* Y-axis for amount values */}
              {/* Tooltip to show exact values on hover */}
              <Tooltip content={<CustomTooltip />} />
              <Legend /> {/* Legend for bars */}
              <Bar dataKey="value">
                {/* Apply different colors to Income and Expenses bars */}
                {monthlyData.map((entry, index) => (
                  <Cell key={`bar-cell-${index}`} fill={entry.name === 'Income' ? COLORS_BAR.income : COLORS_BAR.expense} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No income or expense data for this month to display.</p>
        )}
      </div>
    </div>
  );
}

export default SummaryCharts;
