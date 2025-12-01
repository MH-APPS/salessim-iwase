"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Plus, Trash2, Calculator, FileText, DollarSign, TrendingUp, BarChart3, Database } from "lucide-react"

// --- Types ---

interface Application {
  id: string
  clientName: string // 受注先会社名
  billingCompany: string // 請求先会社名
  accountId: string // 運用アカウント
  media: string // 媒体 (New)
  startDate: string // 掲載開始日
  endDate: string // 掲載終了日
  budget: number // 運用金額 (媒体費予算)
  adjustment: number // 調整額
}

interface CommissionMaster {
  id: string
  accountId: string // 運用アカウント
  media: string // 媒体
  rate: number // 手数料率 (%)
}

interface BillingData {
  id: string
  month: string // 対象月
  accountId: string // 運用アカウント
  spendAmount: number // 費消額
}

// --- Initial Data (Mock) ---

const initialApplications: Application[] = [
  {
    id: "1",
    clientName: "株式会社A",
    billingCompany: "株式会社A",
    accountId: "ACC-001",
    media: "Google",
    startDate: "2023-10-01",
    endDate: "2024-03-31",
    budget: 1000000,
    adjustment: 50000,
  },
  {
    id: "2",
    clientName: "株式会社B",
    billingCompany: "ホールディングスB",
    accountId: "ACC-002",
    media: "Yahoo",
    startDate: "2023-11-01",
    endDate: "2023-12-31",
    budget: 500000,
    adjustment: 0,
  },
  {
    id: "3",
    clientName: "株式会社C",
    billingCompany: "ホールディングスB",
    accountId: "ACC-003",
    media: "Meta",
    startDate: "2023-10-15",
    endDate: "2024-01-31",
    budget: 2000000,
    adjustment: 10000,
  },
]

const initialMasters: CommissionMaster[] = [
  { id: "m1", accountId: "ACC-001", media: "Google", rate: 20 },
  { id: "m2", accountId: "ACC-002", media: "Yahoo", rate: 15 },
  { id: "m3", accountId: "ACC-003", media: "Meta", rate: 20 },
]

const initialBillingData: BillingData[] = [
  { id: "b1", month: "2023-10", accountId: "ACC-001", spendAmount: 150000 },
  { id: "b2", month: "2023-11", accountId: "ACC-001", spendAmount: 200000 },
  { id: "b3", month: "2023-11", accountId: "ACC-002", spendAmount: 100000 },
  { id: "b4", month: "2023-10", accountId: "ACC-003", spendAmount: 500000 },
  { id: "b5", month: "2023-11", accountId: "ACC-003", spendAmount: 800000 },
]

const MEDIA_OPTIONS = [
  "Google",
  "Yahoo",
  "Meta",
  "LINE",
  "TikTok",
  "X (Twitter)",
  "Indeed",
  "求人ボックス",
  "スタンバイ",
  "Other",
]

// --- Utility Components ---

const NumberInput = ({
  value,
  onChange,
  className,
  placeholder,
}: { value: number; onChange: (val: number) => void; className?: string; placeholder?: string }) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "")
    if (rawValue === "" || /^-?\d*\.?\d*$/.test(rawValue)) {
      onChange(Number(rawValue))
    }
  }

  const displayValue = isFocused ? (value === 0 ? "" : value) : value.toLocaleString()

  return (
    <input
      type={isFocused ? "number" : "text"}
      value={displayValue}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={className}
      placeholder={placeholder}
    />
  )
}

export default function SalesRecognitionSim() {
  const [activeTab, setActiveTab] = useState<"applications" | "master" | "billing" | "report">("report")
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [masters, setMasters] = useState<CommissionMaster[]>(initialMasters)
  const [billings, setBillings] = useState<BillingData[]>(initialBillingData)

  // --- Actions ---

  // Applications
  const addApplication = () => {
    const newApp: Application = {
      id: Date.now().toString(),
      clientName: "",
      billingCompany: "",
      accountId: "",
      media: "Google",
      startDate: "",
      endDate: "",
      budget: 0,
      adjustment: 0,
    }
    setApplications([...applications, newApp])
  }

  const updateApplication = (id: string, field: keyof Application, value: any) => {
    setApplications((apps) => apps.map((app) => (app.id === id ? { ...app, [field]: value } : app)))
  }

  const deleteApplication = (id: string) => {
    setApplications((apps) => apps.filter((app) => app.id !== id))
  }

  // Masters
  const addMaster = () => {
    const newMaster: CommissionMaster = {
      id: Date.now().toString(),
      accountId: "",
      media: "Google",
      rate: 20,
    }
    setMasters([...masters, newMaster])
  }

  const updateMaster = (id: string, field: keyof CommissionMaster, value: any) => {
    setMasters((data) => data.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  const deleteMaster = (id: string) => {
    setMasters((data) => data.filter((m) => m.id !== id))
  }

  // Billings
  const addBilling = () => {
    const newBilling: BillingData = {
      id: Date.now().toString(),
      month: new Date().toISOString().slice(0, 7),
      accountId: "",
      spendAmount: 0,
    }
    setBillings([...billings, newBilling])
  }

  const updateBilling = (id: string, field: keyof BillingData, value: any) => {
    setBillings((data) => data.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  const deleteBilling = (id: string) => {
    setBillings((data) => data.filter((b) => b.id !== id))
  }

  // --- Calculation Logic (Core Engine) ---

  // Helper: マスタからレートを取得
  const getCommissionRate = (accountId: string, media: string) => {
    const match = masters.find((m) => m.accountId === accountId && m.media === media)
    return match ? match.rate : 0
  }

  const revenueReport = useMemo(() => {
    const allMonths = Array.from(new Set(billings.map((b) => b.month))).sort()
    const groupedData: Record<string, any> = {}

    billings.forEach((bill) => {
      const app = applications.find((a) => a.accountId === bill.accountId)
      if (!app) return

      const billingCompany = app.billingCompany || "(不明な請求先)"

      if (!groupedData[billingCompany]) {
        groupedData[billingCompany] = {
          name: billingCompany,
          details: [],
          monthlyTotals: {},
        }
        allMonths.forEach((m) => (groupedData[billingCompany].monthlyTotals[m] = 0))
      }

      // マスタからレートを取得 (Account x Media)
      const rate = getCommissionRate(app.accountId, app.media)
      const commission = Math.floor(bill.spendAmount * (rate / 100))

      // 調整額のロジック
      const accountBillings = billings.filter((b) => b.accountId === bill.accountId)
      const firstMonth = accountBillings.map((b) => b.month).sort()[0]

      let monthlyRevenue = bill.spendAmount + commission
      let appliedAdjustment = 0

      if (bill.month === firstMonth) {
        monthlyRevenue += app.adjustment
        appliedAdjustment = app.adjustment
      }

      groupedData[billingCompany].monthlyTotals[bill.month] += monthlyRevenue

      groupedData[billingCompany].details.push({
        month: bill.month,
        account: app.accountId,
        media: app.media,
        spend: bill.spendAmount,
        rate: rate,
        commission: commission,
        adjustment: appliedAdjustment,
        totalRevenue: monthlyRevenue,
      })
    })

    return { allMonths, groupedData }
  }, [applications, billings, masters])

  // --- Formatters ---
  const fmtCurrency = (num: number) =>
    new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(num)

  // --- Components ---

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            <h1 className="text-xl font-bold">売上計上シミュレーター</h1>
          </div>
          <div className="text-sm bg-blue-800 px-3 py-1 rounded">発生主義 / マスタ管理型</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 max-w-7xl">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("applications")}
            className={`pb-2 px-4 font-medium flex items-center gap-2 transition-colors ${activeTab === "applications" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <FileText size={18} />
            申込書情報
          </button>
          <button
            onClick={() => setActiveTab("master")}
            className={`pb-2 px-4 font-medium flex items-center gap-2 transition-colors ${activeTab === "master" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Database size={18} />
            手数料率マスタ
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`pb-2 px-4 font-medium flex items-center gap-2 transition-colors ${activeTab === "billing" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <DollarSign size={18} />
            請求データ (費消額)
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`pb-2 px-4 font-medium flex items-center gap-2 transition-colors ${activeTab === "report" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <BarChart3 size={18} />
            売上計上レポート
          </button>
        </div>

        {/* Tab Content: Applications */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-lg shadow p-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="text-blue-600" />
                申込書情報一覧
              </h2>
              <button
                onClick={addApplication}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> 新規申込書
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase">
                  <tr>
                    <th className="p-3 w-10"></th>
                    <th className="p-3">
                      運用アカウント<span className="text-red-500">*</span>
                    </th>
                    <th className="p-3">
                      媒体<span className="text-red-500">*</span>
                    </th>
                    <th className="p-3">受注先 / 請求先</th>
                    <th className="p-3">期間</th>
                    <th className="p-3 text-right">運用予算</th>
                    <th className="p-3 text-right text-gray-500">適用レート(参考)</th>
                    <th className="p-3 text-right">調整額</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => {
                    const currentRate = getCommissionRate(app.accountId, app.media)
                    const masterExists = currentRate > 0

                    return (
                      <tr key={app.id} className="hover:bg-gray-50 group">
                        <td className="p-3">
                          <button
                            onClick={() => deleteApplication(app.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={app.accountId}
                            onChange={(e) => updateApplication(app.id, "accountId", e.target.value)}
                            className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-200"
                            placeholder="ACC-XXX"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={app.media}
                            onChange={(e) => updateApplication(app.id, "media", e.target.value)}
                            className="w-full p-1 border rounded"
                          >
                            {MEDIA_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 space-y-1">
                          <input
                            type="text"
                            value={app.clientName}
                            onChange={(e) => updateApplication(app.id, "clientName", e.target.value)}
                            className="w-full p-1 border rounded text-xs"
                            placeholder="受注先会社名"
                          />
                          <input
                            type="text"
                            value={app.billingCompany}
                            onChange={(e) => updateApplication(app.id, "billingCompany", e.target.value)}
                            className="w-full p-1 border rounded text-xs bg-yellow-50"
                            placeholder="請求先会社名 (集計キー)"
                          />
                        </td>
                        <td className="p-3 space-y-1">
                          <div className="flex gap-1 items-center">
                            <span className="text-xs text-gray-400 w-4">From</span>
                            <input
                              type="date"
                              value={app.startDate}
                              onChange={(e) => updateApplication(app.id, "startDate", e.target.value)}
                              className="p-1 border rounded text-xs"
                            />
                          </div>
                          <div className="flex gap-1 items-center">
                            <span className="text-xs text-gray-400 w-4">To</span>
                            <input
                              type="date"
                              value={app.endDate}
                              onChange={(e) => updateApplication(app.id, "endDate", e.target.value)}
                              className="p-1 border rounded text-xs"
                            />
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <NumberInput
                            value={app.budget}
                            onChange={(val) => updateApplication(app.id, "budget", val)}
                            className="w-24 p-1 border rounded text-right"
                          />
                        </td>
                        <td className="p-3 text-right">
                          {masterExists ? (
                            <span className="text-gray-600 font-mono">{currentRate}%</span>
                          ) : (
                            <span className="text-red-500 text-xs font-bold">マスタ未設定</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <NumberInput
                            value={app.adjustment}
                            onChange={(val) => updateApplication(app.id, "adjustment", val)}
                            className="w-24 p-1 border rounded text-right"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="p-4 text-xs text-gray-500 bg-gray-50 rounded-b mt-2">
                ※ 適用レートは「運用アカウント」と「媒体」の組み合わせで「手数料率マスタ」から自動参照されます。
                <br />※ レートが表示されない場合は、マスタ設定をご確認ください。
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Master Data */}
        {activeTab === "master" && (
          <div className="bg-white rounded-lg shadow p-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Database className="text-purple-600" />
                手数料率マスタ設定
              </h2>
              <button
                onClick={addMaster}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> 設定追加
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase">
                    <tr>
                      <th className="p-3 w-10"></th>
                      <th className="p-3">運用アカウント</th>
                      <th className="p-3">媒体</th>
                      <th className="p-3 text-right">手数料率 (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {masters.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <button onClick={() => deleteMaster(m.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={m.accountId}
                            onChange={(e) => updateMaster(m.id, "accountId", e.target.value)}
                            className="w-full p-1 border rounded"
                            placeholder="ACC-XXX"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={m.media}
                            onChange={(e) => updateMaster(m.id, "media", e.target.value)}
                            className="w-full p-1 border rounded"
                          >
                            {MEDIA_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            value={m.rate}
                            onChange={(e) => updateMaster(m.id, "rate", Number(e.target.value))}
                            className="w-20 p-1 border rounded text-right font-bold text-purple-700"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Master Guide */}
              <div className="bg-purple-50 p-4 rounded border border-purple-100 h-fit">
                <h3 className="font-bold text-purple-800 mb-2">マスタ管理について</h3>
                <p className="text-sm text-purple-700 leading-relaxed mb-4">
                  運用アカウントと媒体の組み合わせごとに、適用する代行手数料率を定義します。
                  申込書情報と請求データが一致しても、ここに定義がない場合は手数料は計算されません（0円となります）。
                </p>
                <div className="text-xs text-gray-500 bg-white p-3 rounded border">
                  <strong>例:</strong>
                  <br />
                  ACC-001 (Google) : 20%
                  <br />
                  ACC-001 (Yahoo) : 15%
                  <br />
                  <br />※ 同じアカウントIDでも媒体が異なれば別の行として登録してください。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Billing Data */}
        {activeTab === "billing" && (
          <div className="bg-white rounded-lg shadow p-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="text-green-600" />
                月次請求データ (媒体費消額)
              </h2>
              <button
                onClick={addBilling}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> データ追加
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase">
                    <tr>
                      <th className="p-3 w-10"></th>
                      <th className="p-3">対象月</th>
                      <th className="p-3">運用アカウント</th>
                      <th className="p-3 text-right">費消額 (Cost)</th>
                      <th className="p-3 text-right text-gray-400">自動計算: 手数料</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {billings.map((bill) => {
                      const app = applications.find((a) => a.accountId === bill.accountId)
                      const rate = app ? getCommissionRate(app.accountId, app.media) : 0
                      const estimatedComm = Math.floor(bill.spendAmount * (rate / 100))

                      return (
                        <tr key={bill.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <button onClick={() => deleteBilling(bill.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </td>
                          <td className="p-3">
                            <input
                              type="month"
                              value={bill.month}
                              onChange={(e) => updateBilling(bill.id, "month", e.target.value)}
                              className="p-1 border rounded"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={bill.accountId}
                              onChange={(e) => updateBilling(bill.id, "accountId", e.target.value)}
                              className={`p-1 border rounded w-full ${!app ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}
                              placeholder="ACC-XXX"
                            />
                            {!app && <div className="text-xs text-red-500 mt-1">※申込書未登録</div>}
                          </td>
                          <td className="p-3 text-right">
                            <NumberInput
                              value={bill.spendAmount}
                              onChange={(val) => updateBilling(bill.id, "spendAmount", val)}
                              className="w-32 p-1 border rounded text-right font-mono"
                            />
                          </td>
                          <td className="p-3 text-right text-gray-400 font-mono">
                            {fmtCurrency(estimatedComm)} <span className="text-[10px]">({rate}%)</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Side Panel */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200 h-fit">
                <h3 className="font-bold text-gray-700 mb-3">データ連携状況</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-gray-500 text-xs">計算ロジック</span>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>請求データの「アカウントID」を入力</li>
                      <li>申込書情報から「媒体」を特定</li>
                      <li>マスタから「アカウント×媒体」のレートを参照</li>
                      <li>費消額 × レート = 手数料</li>
                    </ol>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span>データ件数:</span>
                      <span className="font-bold">{billings.length} 件</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>費消額合計:</span>
                      <span className="font-bold">
                        {fmtCurrency(billings.reduce((sum, b) => sum + b.spendAmount, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Report */}
        {activeTab === "report" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <TrendingUp className="text-blue-600" />
                  売上計上レポート (請求先法人別)
                </h2>
                <div className="text-sm text-gray-500">
                  <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">計算式</span>
                  費消額 + (費消額 × マスタレート) + 調整額 = 売上
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
                    <tr>
                      <th className="p-4 border-b">請求先会社名</th>
                      {revenueReport.allMonths.map((month) => (
                        <th key={month} className="p-4 border-b text-right min-w-[120px] bg-blue-50 text-blue-900">
                          {month}
                        </th>
                      ))}
                      <th className="p-4 border-b text-right min-w-[140px] bg-gray-200">合計</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Object.values(revenueReport.groupedData).map((group: any) => {
                      const rowTotal = Object.values(group.monthlyTotals).reduce((a: any, b: any) => a + b, 0) as number

                      return (
                        <tr key={group.name} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-gray-800 border-r">{group.name}</td>
                          {revenueReport.allMonths.map((month) => (
                            <td key={month} className="p-4 text-right border-r font-mono">
                              {group.monthlyTotals[month] > 0 ? (
                                <span className="text-blue-700 font-medium">
                                  {fmtCurrency(group.monthlyTotals[month])}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          ))}
                          <td className="p-4 text-right font-bold bg-gray-50 font-mono text-gray-900">
                            {fmtCurrency(rowTotal)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gray-800 text-white font-bold">
                    <tr>
                      <td className="p-4 text-right">月別総合計</td>
                      {revenueReport.allMonths.map((month) => {
                        const monthTotal = Object.values(revenueReport.groupedData).reduce(
                          (sum: number, group: any) => sum + (group.monthlyTotals[month] || 0),
                          0,
                        )
                        return (
                          <td key={month} className="p-4 text-right font-mono">
                            {fmtCurrency(monthTotal)}
                          </td>
                        )
                      })}
                      <td className="p-4 text-right font-mono text-yellow-400">
                        {fmtCurrency(
                          Object.values(revenueReport.groupedData).reduce(
                            (total: number, group: any) =>
                              total + Object.values(group.monthlyTotals).reduce((mSum: any, val: any) => mSum + val, 0),
                            0,
                          ),
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-md font-bold text-gray-700 mb-4 border-b pb-2">計算詳細ログ (内訳)</h3>
              <div className="max-h-64 overflow-y-auto border rounded">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">月</th>
                      <th className="p-2 text-left">請求先</th>
                      <th className="p-2 text-left">アカウント (媒体)</th>
                      <th className="p-2 text-right">費消額</th>
                      <th className="p-2 text-right">マスタレート</th>
                      <th className="p-2 text-right">手数料</th>
                      <th className="p-2 text-right">調整額</th>
                      <th className="p-2 text-right">売上計上額</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.values(revenueReport.groupedData)
                      .flatMap((g: any) => g.details)
                      .map((d: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2">{d.month}</td>
                          <td className="p-2">
                            {
                              revenueReport.groupedData[
                                Object.keys(revenueReport.groupedData).find((k) =>
                                  revenueReport.groupedData[k].details.includes(d),
                                )!
                              ].name
                            }
                          </td>
                          <td className="p-2 text-gray-500">
                            {d.account} <span className="bg-gray-100 px-1 rounded ml-1">{d.media}</span>
                          </td>
                          <td className="p-2 text-right font-mono">{fmtCurrency(d.spend)}</td>
                          <td className="p-2 text-right font-mono text-gray-600">{d.rate}%</td>
                          <td className="p-2 text-right font-mono text-green-600">{fmtCurrency(d.commission)}</td>
                          <td className="p-2 text-right font-mono text-orange-600">
                            {d.adjustment > 0 ? `+${fmtCurrency(d.adjustment)}` : "-"}
                          </td>
                          <td className="p-2 text-right font-mono font-bold">{fmtCurrency(d.totalRevenue)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
