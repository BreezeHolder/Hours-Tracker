import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

export default function App() {
  const [records, setRecords] = useState(() =>
    JSON.parse(localStorage.getItem('work_records') || "{}")
  );
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [clockIn, setClockIn] = useState('09:00');
  const [clockOut, setClockOut] = useState('18:00');

  useEffect(() => {
    localStorage.setItem('work_records', JSON.stringify(records));
  }, [records]);

  const handleSave = () => {
    setRecords({ ...records, [date]: { clockIn, clockOut } });
  };

  const getEff = (inT, outT) => {
    const inD = dayjs(\`\${date}T\${inT}\`);
    const outD = dayjs(\`\${date}T\${outT}\`);
    const total = outD.diff(inD, 'minute') / 60;
    const meal = outD.hour() < 19 ? 1 : 1.5;
    return Math.max(0, total - meal);
  };

  const stats = (() => {
    const arr = Object.values(records);
    const sum = arr.reduce((s, r) => s + getEff(r.clockIn, r.clockOut), 0);
    return { total: sum, avg: arr.length ? (sum / arr.length).toFixed(2) : 0 };
  })();

  const plan = (() => {
    const target = 220, curr = stats.total;
    const days = 22 - Object.keys(records).length;
    if (curr >= target) return '✅ 已达成，无需加班';
    if (days <= 0) return '⚠️ 本月无剩余'
    const per = (target - curr) / days;
    return \`⚡ 接下来每天至少 \${per.toFixed(2)} 小时，可每日延迟至 \${dayjs('09:00','HH:mm').add(per+1,'hour').format('HH:mm')} 下班\`;
  })();

  return (
    <div className="p-6 max-w-xl mx-auto text-sm">
      <h2 className="text-xl font-bold mb-4">📊 工时统计工具</h2>
      <div className="space-y-2">
        <label>日期：
          <input type="date" className="ml-2 border" value={date} onChange={e=>setDate(e.target.value)}/>
        </label>
        <label>上班：
          <input type="time" className="ml-2 border" value={clockIn} onChange={e=>setClockIn(e.target.value)}/>
        </label>
        <label>下班：
          <input type="time" className="ml-2 border" value={clockOut} onChange={e=>setClockOut(e.target.value)}/>
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>保存记录</button>
      </div>
      <div className="mt-6">
        <div>📅 平均有效工时：{stats.avg} 小时</div>
        <div className="mt-2 text-green-700">{plan}</div>
      </div>
      <div className="mt-6 text-xs text-gray-500">
        当前时间：2025年7月7日<br/>Credit to LET
      </div>
    </div>
  );
}
