import { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BarChart({ selectedDay, setSelectedDay }) {
  const chartRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false); 
  const [chartWidth, setChartWidth] = useState('100%');
  const [chartHeight, setChartHeight] = useState(400);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: "Quantidade de Pessoas nas Filas",
      data: [],
      backgroundColor: [],
      borderColor: 'transparent',
      borderRadius: 50,
    }]
  });

  const getLastWeekDateForDay = (dayOfWeek) => {
    const now = new Date();
    const currentDay = now.getDay();

    const dayOffset = currentDay >= dayOfWeek ? currentDay - dayOfWeek : 7 + currentDay - dayOfWeek;
    const lastWeekDate = new Date(now);
    lastWeekDate.setDate(now.getDate() - dayOffset - 7);

    const formattedDate = lastWeekDate.toISOString().split('T')[0];
    console.log(`Dia selecionado: ${formattedDate}`);
    return formattedDate;
  };

  const fetchData = async () => {
    const date = getLastWeekDateForDay(selectedDay);
    try {
      const response = await fetch(`http://localhost:8080/api/monitoramento/pegar/data/${date}`);
      const data = await response.json();
      const realData = calculateRealQuantidade(data);

      const chart = chartRef.current;
      const ctx = chart?.ctx;

      if (ctx) {
        const gradientColors = realData.map(() => {
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, darkMode ? '#B2B9C0' : '#B2B9C0');
          gradient.addColorStop(1, darkMode ? '#E0E2E5' : '#E0E2E5');
          return gradient;
        });

        setChartData({
          labels: realData.map((data) => data.datetime),
          datasets: [{
            label: "Quantidade de Pessoas nas Filas",
            data: realData.map((data) => data.quantidade),
            backgroundColor: gradientColors,
            borderColor: 'transparent',
            borderRadius: 5,
          }]
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const calculateRealQuantidade = (data) => {
    const groupedData = {};
    const timeInterval = isSmallScreen ? 20 : 10;

    data.forEach((entry) => {
      const { dataRegistro, horarioRegistro, quantidade } = entry;
      if (!dataRegistro || !horarioRegistro) return;

      const [hour, minute] = horarioRegistro.split(':');
      const roundedMinute = Math.floor(minute / timeInterval) * timeInterval;
      const timeKey = `${hour}:${roundedMinute.toString().padStart(2, '0')}`;

      if (!groupedData[timeKey]) {
        groupedData[timeKey] = { totalQuantidade: 0, count: 0 };
      }

      groupedData[timeKey].totalQuantidade += quantidade;
      groupedData[timeKey].count += 1;
    });

    const resultData = Object.keys(groupedData).map((timeKey) => {
      const avgQuantidade = groupedData[timeKey].totalQuantidade / groupedData[timeKey].count;
      return {
        datetime: timeKey,
        quantidade: avgQuantidade,
      };
    });

    return resultData.sort((a, b) => a.datetime.localeCompare(b.datetime));
  };

  useEffect(() => {
    fetchData();
  }, [selectedDay]);

  const [chartOptions, setChartOptions] = useState({});
  useEffect(() => {
    setChartOptions({
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: darkMode ? '#ffffff' : '#ffffff',
          },
        },
        tooltip: {
          backgroundColor: darkMode ? '#ffffff' : '#ffffff',
          titleColor: darkMode ? '#ffffff' : '#ffffff',
          bodyColor: darkMode ? '#ffffff' : '#ffffff',
        },
      },
      scales: {
        x: {
          ticks: {
            color: darkMode ? '#ffffff' : '#ffffff',
          },
        },
        y: {
          ticks: {
            color: darkMode ? '#ffffff' : '#ffffff',
          },
        },
      },
    });
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 932) {
        setChartWidth('100%');
        setChartHeight(200);
        setIsSmallScreen(true);
      } else {
        setChartWidth('90%');
        setChartHeight(800);
        setIsSmallScreen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const daysOfWeek = [
    { value: 0, label: 'DOM' },
    { value: 1, label: 'SEG' },
    { value: 2, label: 'TER' },
    { value: 3, label: 'QUA' },
    { value: 4, label: 'QUI' },
    { value: 5, label: 'SEX' },
    { value: 6, label: 'SAB' },
  ];

  return (
    <div style={{ padding: '10px', textAlign: 'center' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '10px',
      }}>
        {daysOfWeek.map((day) => (
          <div
            key={day.value}
            style={{
              margin: '0 5px',
              padding: isSmallScreen ? '3px 8px' : '10px 55px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: '#ffffff',
              fontWeight: 'normal',
              position: 'relative',
              fontSize: isSmallScreen ? '14px' : '16px',
            }}
            onClick={() => setSelectedDay(day.value)}
          >
            <span
              style={{
                display: 'inline-block',
                borderBottom: selectedDay === day.value ? '2px solid #ffffff' : '2px solid transparent',
                width: '100%',
                transition: 'border-bottom 0.3s ease',
              }}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>
      <div style={{ width: chartWidth, height: `${chartHeight}px`, margin: '0 auto', maxWidth: '1200px' }}>
        <Bar ref={chartRef} data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default BarChart;
