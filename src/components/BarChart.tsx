
interface ChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
}

const BarChart = ({ data, title }: BarChartProps) => {
  const maxValue = Math.max(...data.map(d => d.value), 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
      <div className="flex items-end space-x-2">
        {data.map(item => (
          <div key={item.label} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-blue-500 rounded-t-md"
              style={{ height: `${(item.value / maxValue) * 200}px` }}
            ></div>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
