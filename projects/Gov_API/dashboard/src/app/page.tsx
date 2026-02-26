'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { fetchTradeData } from '@/lib/api-client';
import PriceChart from '@/components/PriceChart';
import AreaSelector from '@/components/AreaSelector';

import type { FilterState } from '@/components/SidebarFilters';
import AreaRankingWidget from '@/components/AreaRankingWidget';
import TransactionTable from '@/components/TransactionTable';
import DistrictTrendTable from '@/components/DistrictTrendTable';
import Hero from '@/components/Hero';
import TrustSection from '@/components/TrustSection';
import YearSelector from '@/components/YearSelector';
import ConversionBanner from '@/components/ConversionBanner';
import PropertyForm, { PropertyCondition } from '@/components/PropertyForm';
import EstimateResult, { EstimateData } from '@/components/EstimateResult';
import { BarChart3, Download, Search, ArrowRight, Calendar, DollarSign, Home as HomeIcon, Activity } from 'lucide-react';

export default function Home() {
  const [selectedAreaName, setSelectedAreaName] = useState('東京都 千代田区');
  const [tradeData, setTradeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYears, setCurrentYears] = useState<number[]>([2025, 2024, 2023]);
  const [currentPref, setCurrentPref] = useState('13');
  const [currentCity, setCurrentCity] = useState<string | undefined>('13101');
  const [chartMetric, setChartMetric] = useState<'unitPrice' | 'totalPrice' | 'history'>('unitPrice');


  // Drill-down State
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    types: [],
    layouts: [],
  });

  // Property Estimate State
  const [propertyCondition, setPropertyCondition] = useState<PropertyCondition | null>(null);
  const [showEstimate, setShowEstimate] = useState(false);
  const estimateRef = useRef<HTMLDivElement>(null);

  // Filter Logic
  const filteredData = React.useMemo(() => {
    return tradeData.filter(item => {
      // Type Filter
      if (filters.types.length > 0) {
        if (!filters.types.some(t => item.Type.includes(t))) return false;
      }

      // Layout Filter
      if (filters.layouts.length > 0) {
        const plan = item.FloorPlan?.trim();
        if (!plan || !filters.layouts.includes(plan)) return false;
      }

      // Price Filter
      const price = parseInt(item.TradePrice || '0', 10);
      if (filters.minPrice && price < filters.minPrice * 10000) return false;
      if (filters.maxPrice && price > filters.maxPrice * 10000) return false;

      // Area Filter
      const area = parseInt(item.Area || '0', 10);
      if (filters.minArea && area < filters.minArea) return false;
      if (filters.maxArea && area > filters.maxArea) return false;

      return true;
    });
  }, [tradeData, filters]);

  // Summary Stats
  const summaryStats = React.useMemo(() => {
    if (filteredData.length === 0) return null;
    let totalPrice = 0;
    let totalUnitPrice = 0;
    let priceCount = 0;
    let latestPeriod = '';

    filteredData.forEach(item => {
      const tp = parseInt(item.TradePrice || '0', 10);
      const area = parseInt(item.Area || '0', 10);
      if (tp > 0) {
        totalPrice += tp;
        if (area > 0) {
          totalUnitPrice += Math.round(tp / area);
          priceCount++;
        }
      }
      if (item.Period && item.Period > latestPeriod) latestPeriod = item.Period;
    });

    return {
      avgTotalPrice: priceCount > 0 ? Math.round(totalPrice / filteredData.length) : 0,
      avgUnitPrice: priceCount > 0 ? Math.round(totalUnitPrice / priceCount) : 0,
      count: filteredData.length,
      latestPeriod,
    };
  }, [filteredData]);

  // Similar Trade Filtering & Estimate Calculation
  const estimateData: EstimateData | null = React.useMemo(() => {
    if (!propertyCondition || tradeData.length === 0) return null;

    const { type, area, floorPlan, buildingAge } = propertyCondition;
    const areaMargin = Math.max(area * 0.3, 15); // ±30% or 15m² minimum

    // Parse building year range
    let ageMin = 0, ageMax = 999;
    if (buildingAge === '0-5') { ageMin = 0; ageMax = 5; }
    else if (buildingAge === '5-10') { ageMin = 5; ageMax = 10; }
    else if (buildingAge === '10-20') { ageMin = 10; ageMax = 20; }
    else if (buildingAge === '20-30') { ageMin = 20; ageMax = 30; }
    else if (buildingAge === '30+') { ageMin = 30; ageMax = 999; }

    const currentYear = new Date().getFullYear();

    // Filter similar trades
    let similar = tradeData.filter(item => {
      // Must match type
      if (!item.Type?.includes(type.replace('中古マンション等', 'マンション').replace('宅地', '宅地'))) {
        if (type === '中古マンション等' && !item.Type?.includes('マンション')) return false;
        if (type === '宅地(土地と建物)' && !item.Type?.includes('宅地(土地と建物)')) return false;
        if (type === '宅地(土地)' && !item.Type?.includes('宅地(土地)')) return false;
      }

      // Area range
      const itemArea = parseInt(item.Area || '0', 10);
      if (itemArea <= 0) return false;
      if (Math.abs(itemArea - area) > areaMargin) return false;

      // Floor plan (soft match)
      if (floorPlan && item.FloorPlan) {
        const planMatch = item.FloorPlan.includes(floorPlan.replace(/[0-9]/g, '')) ||
          item.FloorPlan === floorPlan;
        if (!planMatch) return false;
      }

      // Building age
      if (buildingAge && item.BuildingYear) {
        const match = item.BuildingYear.match(/(\d{4})/);
        if (match) {
          const builtYear = parseInt(match[1], 10);
          const age = currentYear - builtYear;
          if (age < ageMin || age > ageMax) return false;
        }
      }

      return true;
    });

    // If too few results, relax criteria (drop floor plan + building age)
    if (similar.length < 5) {
      similar = tradeData.filter(item => {
        if (type === '中古マンション等' && !item.Type?.includes('マンション')) return false;
        if (type === '宅地(土地と建物)' && !item.Type?.includes('宅地(土地と建物)')) return false;
        if (type === '宅地(土地)' && !item.Type?.includes('宅地(土地)')) return false;
        const itemArea = parseInt(item.Area || '0', 10);
        if (itemArea <= 0) return false;
        if (Math.abs(itemArea - area) > areaMargin * 1.5) return false;
        return true;
      });
    }

    if (similar.length === 0) return null;

    // Get prices
    const prices = similar
      .map(item => parseInt(item.TradePrice || '0', 10))
      .filter(p => p > 0)
      .sort((a, b) => a - b);

    if (prices.length === 0) return null;

    // Percentiles
    const p25 = prices[Math.floor(prices.length * 0.25)];
    const p50 = prices[Math.floor(prices.length * 0.5)];
    const p75 = prices[Math.floor(prices.length * 0.75)];

    // YoY change calculation
    let yoyChange = 0;
    const latestYearTrades = similar.filter(item => item.Period?.includes(currentYears[0]?.toString() || '2023'));
    const prevYearTrades = similar.filter(item => item.Period?.includes(((currentYears[0] || 2023) - 1).toString()));
    if (latestYearTrades.length > 0 && prevYearTrades.length > 0) {
      const avgLatest = latestYearTrades.reduce((s, i) => s + parseInt(i.TradePrice || '0', 10), 0) / latestYearTrades.length;
      const avgPrev = prevYearTrades.reduce((s, i) => s + parseInt(i.TradePrice || '0', 10), 0) / prevYearTrades.length;
      if (avgPrev > 0) yoyChange = ((avgLatest - avgPrev) / avgPrev) * 100;
    }

    // Top 3 most similar (closest in area)
    const sortedByAreaDiff = [...similar]
      .sort((a, b) => Math.abs(parseInt(a.Area || '0') - area) - Math.abs(parseInt(b.Area || '0') - area))
      .slice(0, 3);

    // Trend data: yearly average prices
    const yearMap: Record<string, { total: number; count: number }> = {};
    similar.forEach(item => {
      const periodMatch = item.Period?.match(/(\d{4})/);
      if (periodMatch) {
        const yr = periodMatch[1];
        const tp = parseInt(item.TradePrice || '0', 10);
        if (tp > 0) {
          if (!yearMap[yr]) yearMap[yr] = { total: 0, count: 0 };
          yearMap[yr].total += tp;
          yearMap[yr].count++;
        }
      }
    });
    const trendData = Object.entries(yearMap)
      .map(([yr, v]) => ({ period: `${yr}年`, price: Math.round(v.total / v.count) }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return {
      lowPrice: p25,
      highPrice: p75,
      medianPrice: p50,
      matchCount: prices.length,
      yoyChange,
      similarTrades: sortedByAreaDiff,
      areaName: selectedAreaName,
      trendData,
    };
  }, [propertyCondition, tradeData, selectedAreaName, currentYears]);

  // Initial fetch and handling area selection
  const handleFetchData = async (years: number[], prefCode: string, cityCode?: string) => {
    setLoading(true);
    setCurrentYears(years);
    setCurrentPref(prefCode);
    setCurrentCity(cityCode);

    try {
      const data = await fetchTradeData(years, prefCode, cityCode);
      const sortedData = data.sort((a, b) => {
        if (!a.Period || !b.Period) return 0;
        return b.Period.localeCompare(a.Period);
      });
      setTradeData(sortedData);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Historic Data Fetcher (Drill-down)
  const fetchDistrictHistory = async (districtName: string) => {
    setHistoryLoading(true);
    setSelectedDistrict(districtName);
    setChartMetric('history');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    try {
      const results = await Promise.all(years.map(y => fetchTradeData([y], currentPref, currentCity)));
      const allData = results.flat();
      const districtData = allData.filter(item =>
        currentCity ? item.DistrictName === districtName : item.Municipality === districtName
      );

      const history = years.map(year => {
        const yearData = districtData.filter(d => d.Period && d.Period.includes(year.toString()));
        if (yearData.length === 0) return null;

        let totalUnitPrice = 0;
        let count = 0;
        yearData.forEach(d => {
          const price = parseInt(d.TradePrice);
          const area = parseInt(d.Area);
          if (!isNaN(price) && !isNaN(area) && area > 0) {
            totalUnitPrice += Math.round(price / area);
            count++;
          }
        });

        if (count === 0) return null; // No valid data for this year

        return {
          period: year.toString(),
          unitPrice: Math.round(totalUnitPrice / count),
          count
        };
      }).filter(Boolean).reverse() as { period: string; unitPrice: number; count: number }[];

      setHistoryData(history);
    } catch (e) {
      console.error('History fetch error:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    handleFetchData([2025, 2024, 2023], '13', '13101');
  }, []);

  const handleAreaSelect = (prefCode: string, cityCode?: string, prefName?: string, cityName?: string) => {
    handleFetchData(currentYears, prefCode, cityCode);
    if (prefName) {
      setSelectedAreaName(cityName ? `${prefName} ${cityName}` : prefName);
    } else {
      setSelectedAreaName(`${prefCode}エリア`);
    }
    // Reset estimate on area change
    setPropertyCondition(null);
    setShowEstimate(false);
  };

  const handleYearChange = (years: number[]) => {
    handleFetchData(years, currentPref, currentCity);
  };

  const handleExportCSV = () => {
    if (tradeData.length === 0) return;
    const headers = ['取引時期', '種類', 'エリア', '価格(円)', '平米単価(円)', '面積(m2)', '間取り'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.Period, item.Type, `${item.Municipality} ${item.DistrictName}`,
        item.TradePrice, item.UnitPrice, item.Area, item.FloorPlan || '-'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trade_data_${currentYears.join('-')}_${currentPref}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = React.useMemo(() => {
    const aggregated: Record<string, { totalUnitPrice: number; totalTradePrice: number; count: number }> = {};
    filteredData.forEach((item) => {
      const period = item.Period ? item.Period.replace('年第', '-Q').replace('四半期', '') : 'Unknown';
      let unitPrice = parseInt(item.UnitPrice || '0', 10);
      const tradePrice = parseInt(item.TradePrice || '0', 10);
      const area = parseInt(item.Area || '0', 10);

      if ((!unitPrice || isNaN(unitPrice)) && tradePrice > 0 && area > 0) {
        unitPrice = Math.round(tradePrice / area);
      }

      if (unitPrice > 0) {
        if (!aggregated[period]) {
          aggregated[period] = { totalUnitPrice: 0, totalTradePrice: 0, count: 0 };
        }
        aggregated[period].totalUnitPrice += unitPrice;
        aggregated[period].totalTradePrice += tradePrice;
        aggregated[period].count += 1;
      }
    });

    return Object.entries(aggregated).map(([period, val]) => ({
      period,
      unitPrice: Math.round(val.totalUnitPrice / val.count),
      totalPrice: Math.round(val.totalTradePrice / val.count),
      count: val.count,
    })).sort((a, b) => a.period.localeCompare(b.period));
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Hero />

      <TrustSection />

      {/* Property Condition Form Section */}
      <section id="property-form" className="py-20 bg-white relative">
        <div className="container mx-auto px-6 max-w-xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
              あなたの物件情報を<br className="hidden md:block" />
              入力してください
            </h2>
            <p className="text-stone-500 mt-3 text-sm">
              過去の取引データから、あなたの物件に近い相場を即座に算出します
            </p>
          </div>

          {/* Area Selector inside the form */}
          <div className="bg-stone-50 rounded-2xl p-6 mb-6 border border-stone-100">
            <h3 className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-4">
              <Search className="w-4 h-4 text-accent" />
              エリアを選択
              <span className="text-xs text-stone-400 font-normal ml-auto">{selectedAreaName}</span>
            </h3>
            <AreaSelector onSelect={handleAreaSelect} />
          </div>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
            <PropertyForm
              onSubmit={(condition) => {
                setPropertyCondition(condition);
                setShowEstimate(true);
                // Also apply type filter to main data
                setFilters(prev => ({ ...prev, types: [condition.type] }));
                // Scroll to estimate result
                setTimeout(() => {
                  estimateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
              }}
              loading={loading}
            />
          </div>
        </div>
      </section>


      {/* Estimate Result Section */}
      <div ref={estimateRef}>
        {showEstimate && estimateData && (
          <section className="py-16 bg-stone-50">
            <div className="container mx-auto px-6 max-w-3xl">
              <div className="text-center mb-10">
                <p className="text-sm font-bold text-accent mb-2">分析完了</p>
                <h2 className="text-3xl font-black text-stone-800">
                  {selectedAreaName}での推定結果
                </h2>
              </div>
              <EstimateResult data={estimateData} />
            </div>
          </section>
        )}
        {showEstimate && !estimateData && !loading && (
          <section className="py-16 bg-stone-50">
            <div className="container mx-auto px-6 max-w-xl text-center">
              <p className="text-lg font-bold text-stone-600 mb-2">条件に一致する取引データが見つかりませんでした</p>
              <p className="text-sm text-stone-400">エリアを広げるか、条件を緩めて再検索してみてください</p>
            </div>
          </section>
        )}
      </div>
      {/* Detail Dashboard - shown after estimate */}
      {showEstimate && estimateData && (
        <main id="analysis-section" className="py-20 bg-stone-50">
          <div className="container mx-auto px-6 max-w-5xl">
            {/* Results Display */}
            <div>
              <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-stone-800 tracking-tight">
                    {selectedAreaName} <span className="text-lg font-normal text-stone-400 ml-2">の調査結果</span>
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {currentYears.map(year => (
                      <span key={year} className="inline-flex items-center px-2.5 py-1 rounded-full bg-stone-200 text-stone-700 text-xs font-bold">
                        {year}年
                      </span>
                    ))}
                    {filters.types.map(t => (
                      <span key={t} className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </header>

              {/* Summary Cards */}
              {summaryStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white p-5 rounded-2xl shadow-card border border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-bold text-stone-400">平均取引価格</span>
                    </div>
                    <p className="text-2xl font-black text-stone-800">
                      {(summaryStats.avgTotalPrice / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      <span className="text-sm font-bold text-stone-400 ml-1">万円</span>
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-card border border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <HomeIcon className="w-4 h-4 text-stone-400" />
                      <span className="text-xs font-bold text-stone-400">平均平米単価</span>
                    </div>
                    <p className="text-2xl font-black text-stone-800">
                      {(summaryStats.avgUnitPrice / 10000).toFixed(1)}
                      <span className="text-sm font-bold text-stone-400 ml-1">万円/m²</span>
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-card border border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-bold text-stone-400">取引件数</span>
                    </div>
                    <p className="text-2xl font-black text-stone-800">
                      {summaryStats.count.toLocaleString()}
                      <span className="text-sm font-bold text-stone-400 ml-1">件</span>
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-card border border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      <span className="text-xs font-bold text-stone-400">データ時点</span>
                    </div>
                    <p className="text-lg font-black text-stone-800">
                      {summaryStats.latestPeriod || '-'}
                    </p>
                  </div>
                </div>
              )}

              {/* Ranking */}
              <div className="bg-white p-6 rounded-2xl shadow-card border border-stone-100 mb-8">
                <AreaRankingWidget
                  data={tradeData}
                  currentPref={currentPref}
                  currentCity={currentCity}
                  onSelectRow={fetchDistrictHistory}
                />
              </div>

              {/* Chart and Trend */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[600px] mb-8">
                <section className="bg-white p-6 rounded-2xl shadow-card border border-stone-100 flex flex-col relative overflow-hidden">
                  {historyLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-stone-800 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-teal-600" />
                      {selectedDistrict && chartMetric === 'history' ? `${selectedDistrict}の推移` : '価格推移トレンド'}
                    </h3>
                    <div className="flex gap-2">
                      {selectedDistrict && (
                        <button
                          onClick={() => { setSelectedDistrict(null); setChartMetric('unitPrice'); }}
                          className="text-xs font-bold text-stone-500 hover:text-primary bg-stone-100 hover:bg-stone-200 rounded-lg px-3 py-1 transition-colors"
                        >
                          ✕ 戻る
                        </button>
                      )}
                      <select
                        value={chartMetric}
                        onChange={(e) => setChartMetric(e.target.value as any)}
                        className="text-sm font-bold border-none bg-stone-100 rounded-lg px-3 py-1 text-stone-700 outline-none hover:bg-stone-200 transition-colors"
                      >
                        <option value="unitPrice">平米単価</option>
                        <option value="totalPrice">取引総額</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <PriceChart
                      data={chartMetric === 'history' ? historyData : chartData}
                      metric={chartMetric}
                    />
                  </div>
                </section>

                <div className="bg-white rounded-2xl shadow-card border border-stone-100 overflow-hidden">
                  <DistrictTrendTable
                    data={
                      chartMetric === 'history'
                        ? historyData
                        : chartData.map(d => ({ period: d.period, unitPrice: d.unitPrice, count: d.count }))
                    }
                    districtName={selectedDistrict || selectedAreaName}
                  />
                </div>
              </div>

              {/* Mini CTA */}
              <div className="bg-stone-900 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div>
                  <p className="text-white font-bold text-base">相場がわかったら、実際の売却価格を<span className="text-teal-400">匿名・机上査定</span>でチェック</p>
                  <p className="text-stone-400 text-sm mt-1">「まずは価格だけ知りたい」「営業電話は避けたい」という方に最適です。</p>
                </div>
                <a
                  href="#" /* TODO: タウンライフのASPリンクに差し替え */
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="shrink-0 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                >
                  無料・匿名で査定してみる
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Transaction List - always visible */}
              <div className="bg-white rounded-2xl shadow-card border border-stone-100 overflow-hidden">
                <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                  <p className="text-sm text-stone-500 font-medium">全 {filteredData.length} 件の取引事例</p>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm font-bold transition-all"
                  >
                    <Download className="w-4 h-4" />
                    CSV保存
                  </button>
                </div>
                <TransactionTable data={filteredData} />
              </div>
            </div>
          </div>
        </main>
      )}

      <ConversionBanner />

      <footer className="py-12 bg-primary text-white border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <p className="text-stone-400 text-sm mb-4">© 2026 売るとき相場チェッカー</p>
          <p className="text-xs text-stone-500 max-w-2xl mx-auto mb-4 leading-relaxed">
            当サイトで表示される価格は、国土交通省の過去取引データに基づく参考値であり、実際の売却価格を保証するものではありません。
            正確な査定にはプロの不動産業者による査定をお勧めします。当サイトはアフィリエイトプログラムに参加しています。
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-stone-500">
            <Link href="/contact" className="hover:text-stone-300 transition-colors">お問い合わせ</Link>
            <Link href="/privacy" className="hover:text-stone-300 transition-colors">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-stone-300 transition-colors">利用規約</Link>
            <Link href="/disclaimer" className="hover:text-stone-300 transition-colors">免責事項</Link>
          </div>
        </div>
      </footer>
    </div >
  );
}
