import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ReferenceLine, ResponsiveContainer,
  LineChart, Line, ComposedChart
} from 'recharts';

const LabValueChart = ({ parameters }) => {
  const [chartType, setChartType] = useState('bar');
  const [sortBy, setSortBy] = useState('name');
  const [showNormalOnly, setShowNormalOnly] = useState(false);
  
  // Check if parameters is defined before processing
  if (!parameters || !Array.isArray(parameters) || parameters.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No parameters available for visualization.</p>
      </div>
    );
  }

  // Filter parameters that have numeric values and reference ranges
  const chartableParams = parameters.filter(param => {
    // Check if value is a number
    const isNumeric = !isNaN(parseFloat(param.value)) && param.value !== null;
    
    // Check if we have a reference range that can be parsed
    let hasRange = false;
    if (param.reference_range) {
      // Try to extract numeric range in format like "3.5-5.0" or "< 200" or "> 40"
      const rangeMatch = param.reference_range.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
      const lessThanMatch = param.reference_range.match(/<\s*(\d+\.?\d*)/);
      const greaterThanMatch = param.reference_range.match(/>\s*(\d+\.?\d*)/);
      
      hasRange = rangeMatch || lessThanMatch || greaterThanMatch;
    }
    
    return isNumeric && hasRange;
  });
  
  // If we don't have enough chartable parameters, don't render
  if (chartableParams.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No numeric parameters with reference ranges available for visualization.</p>
      </div>
    );
  }
  
  // Process data for chart
  const chartData = chartableParams.map(param => {
    // Extract reference range values
    let minRef = null;
    let maxRef = null;
    
    if (param.reference_range) {
      // Try to extract range in format "3.5-5.0"
      const rangeMatch = param.reference_range.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
      if (rangeMatch) {
        minRef = parseFloat(rangeMatch[1]);
        maxRef = parseFloat(rangeMatch[2]);
      } else {
        // Try to extract "< 200" format
        const lessThanMatch = param.reference_range.match(/<\s*(\d+\.?\d*)/);
        if (lessThanMatch) {
          maxRef = parseFloat(lessThanMatch[1]);
        } else {
          // Try to extract "> 40" format
          const greaterThanMatch = param.reference_range.match(/>\s*(\d+\.?\d*)/);
          if (greaterThanMatch) {
            minRef = parseFloat(greaterThanMatch[1]);
          }
        }
      }
    }
    
    // Calculate percentage of range
    let percentOfRange = null;
    if (minRef !== null && maxRef !== null) {
      const range = maxRef - minRef;
      if (range > 0) {
        percentOfRange = ((parseFloat(param.value) - minRef) / range) * 100;
      }
    }
    
    // Determine status based on reference range
    let status = "normal";
    if (param.status) {
      status = param.status.toLowerCase();
    } else if (minRef !== null && maxRef !== null) {
      if (parseFloat(param.value) < minRef) status = "low";
      else if (parseFloat(param.value) > maxRef) status = "high";
    } else if (minRef !== null && parseFloat(param.value) < minRef) {
      status = "low";
    } else if (maxRef !== null && parseFloat(param.value) > maxRef) {
      status = "high";
    }
    
    return {
      name: param.name,
      value: parseFloat(param.value),
      minRef,
      maxRef,
      unit: param.unit || "",
      status,
      percentOfRange,
      date: param.date || new Date().toISOString().split('T')[0]
    };
  });
  
  // Apply filters and sorting
  let filteredData = [...chartData];
  
  // Filter by normal status if enabled
  if (showNormalOnly) {
    filteredData = filteredData.filter(item => item.status === 'normal');
  }
  
  // Sort data based on selected sort method
  switch (sortBy) {
    case 'value':
      filteredData.sort((a, b) => a.value - b.value);
      break;
    case 'status':
      filteredData.sort((a, b) => a.status.localeCompare(b.status));
      break;
    case 'percentOfRange':
      filteredData.sort((a, b) => {
        if (a.percentOfRange === null) return 1;
        if (b.percentOfRange === null) return -1;
        return a.percentOfRange - b.percentOfRange;
      });
      break;
    default:
      filteredData.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // Calculate deviation from reference range for percentage view
  const normalizedData = filteredData.map(item => {
    let normalizedValue = 0;
    
    if (item.minRef !== null && item.maxRef !== null) {
      const midpoint = (item.minRef + item.maxRef) / 2;
      const range = (item.maxRef - item.minRef) / 2;
      
      // Normalize value to percentage deviation from midpoint
      if (range > 0) {
        normalizedValue = ((item.value - midpoint) / range) * 100;
      }
    } else if (item.minRef !== null) {
      // For "greater than" reference values
      normalizedValue = ((item.value - item.minRef) / item.minRef) * 100;
    } else if (item.maxRef !== null) {
      // For "less than" reference values
      normalizedValue = ((item.value - item.maxRef) / item.maxRef) * 100;
    }
    
    return {
      ...item,
      normalizedValue: Math.min(Math.max(normalizedValue, -100), 100) // Clamp between -100% and 100%
    };
  });
  
  // Function to get color based on status
  const getBarColor = (status) => {
    switch (status) {
      case "high": return "#ef4444";
      case "low": return "#3b82f6";
      default: return "#22c55e";
    }
  };
  
  // Custom tooltip component for better display
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-md text-xs">
          <p className="font-bold">{data.name}</p>
          <p>Value: {data.value} {data.unit}</p>
          {data.minRef !== null && data.maxRef !== null && (
            <p>Reference Range: {data.minRef} - {data.maxRef} {data.unit}</p>
          )}
          {data.minRef !== null && data.maxRef === null && (
            <p>Reference Range: &gt; {data.minRef} {data.unit}</p>
          )}
          {data.minRef === null && data.maxRef !== null && (
            <p>Reference Range: &lt; {data.maxRef} {data.unit}</p>
          )}
          {data.percentOfRange !== null && (
            <p>Percent of Range: {data.percentOfRange.toFixed(1)}%</p>
          )}
          <p className="font-medium" style={{ color: getBarColor(data.status) }}>
            Status: {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Render chart based on selected type
  const renderChart = () => {
    if (chartType === 'deviation') {
      // Deviation chart shows how far values are from the reference range midpoint
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={normalizedData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              domain={[-100, 100]}
              ticks={[-100, -50, 0, 50, 100]}
              label={{ value: 'Deviation from Reference Midpoint (%)', position: 'bottom', offset: 0 }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine x={0} stroke="#666" />
            <ReferenceLine x={-50} stroke="#3b82f6" strokeDasharray="3 3" />
            <ReferenceLine x={50} stroke="#ef4444" strokeDasharray="3 3" />
            <Bar 
              dataKey="normalizedValue"
              name="% Deviation"
              fill={(entry) => getBarColor(entry.status)}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (chartType === 'line') {
      // Line chart view
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: (entry) => getBarColor(entry.status), r: 6 }}
              activeDot={{ r: 8 }}
              name="Value"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      // Default bar chart
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="value"
              name="Value"
              fill={(entry) => getBarColor(entry.status)}
              isAnimationActive={false}
            />
            {filteredData.map(param => {
              const refs = [];
              if (param.minRef !== null) {
                refs.push(
                  <ReferenceLine 
                    key={`min-${param.name}`}
                    y={param.name}
                    x={param.minRef}
                    stroke="#4b5563"
                    strokeDasharray="3 3"
                    label={{ value: 'Min', position: 'insideTopLeft', fill: '#4b5563', fontSize: 10 }}
                  />
                );
              }
              
              if (param.maxRef !== null) {
                refs.push(
                  <ReferenceLine 
                    key={`max-${param.name}`}
                    y={param.name}
                    x={param.maxRef}
                    stroke="#4b5563"
                    strokeDasharray="3 3"
                    label={{ value: 'Max', position: 'insideTopRight', fill: '#4b5563', fontSize: 10 }}
                  />
                );
              }
              return refs;
            })}
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };
  
  // Calculate summary statistics
  const abnormalCount = chartData.filter(item => item.status !== 'normal').length;
  const normalCount = chartData.length - abnormalCount;
  const highCount = chartData.filter(item => item.status === 'high').length;
  const lowCount = chartData.filter(item => item.status === 'low').length;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Lab Values Visualization</h3>
        
        <div className="flex space-x-4">
          {/* Chart type selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Chart Type:</label>
            <select 
              className="py-1 px-2 border border-gray-300 rounded text-sm"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="deviation">Deviation Chart</option>
            </select>
          </div>
          
          {/* Sort selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Sort By:</label>
            <select 
              className="py-1 px-2 border border-gray-300 rounded text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="value">Value</option>
              <option value="status">Status</option>
              <option value="percentOfRange">% of Range</option>
            </select>
          </div>
          
          {/* Normal only filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">
              <input 
                type="checkbox" 
                className="mr-1"
                checked={showNormalOnly}
                onChange={(e) => setShowNormalOnly(e.target.checked)}
              />
              Normal Values Only
            </label>
          </div>
        </div>
      </div>
      
      {/* Summary statistics */}
      <div className="mb-4 grid grid-cols-4 gap-4">
        <div className="bg-gray-100 p-3 rounded-lg text-center">
          <p className="text-xl font-bold">{chartData.length}</p>
          <p className="text-xs text-gray-600">Total Parameters</p>
        </div>
        <div className="bg-green-100 p-3 rounded-lg text-center">
          <p className="text-xl font-bold text-green-600">{normalCount}</p>
          <p className="text-xs text-gray-600">Normal</p>
        </div>
        <div className="bg-red-100 p-3 rounded-lg text-center">
          <p className="text-xl font-bold text-red-600">{highCount}</p>
          <p className="text-xs text-gray-600">High</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg text-center">
          <p className="text-xl font-bold text-blue-600">{lowCount}</p>
          <p className="text-xs text-gray-600">Low</p>
        </div>
      </div>
      
      <div className="h-96 w-full">
        {renderChart()}
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm">Normal</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm">High</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm">Low</span>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm">
        <h4 className="font-semibold mb-2">About This Chart</h4>
        <p className="text-gray-600 mb-1">
          This visualization shows lab values relative to their reference ranges. Bar colors indicate whether values are normal (green), high (red), or low (blue).
        </p>
        <p className="text-gray-600">
          • <span className="font-medium">Bar Chart</span>: Shows actual values with reference lines
          <br />
          • <span className="font-medium">Line Chart</span>: Shows trend of values across parameters
          <br />
          • <span className="font-medium">Deviation Chart</span>: Shows how far values deviate from the midpoint of their reference ranges
        </p>
      </div>
    </div>
  );
};

export default LabValueChart;