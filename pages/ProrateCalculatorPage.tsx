
import React, { useState, useCallback, useMemo } from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  type?: 'text' | 'number' | 'date' | 'email';
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  pattern?: string;
  info?: string;
  min?: string;
  max?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id, label, value, onChange, placeholder, type = "text", inputMode, pattern, info, min, max
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-sky-200 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={type === 'text' || type === 'number' ? inputMode : undefined}
      pattern={type === 'text' ? pattern : undefined}
      min={type === 'date' ? min : undefined}
      max={type === 'date' ? max : undefined}
      className="w-full p-3 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors placeholder-slate-400"
      style={type === 'date' ? { colorScheme: 'dark' } : {}}
    />
    {info && <p className="mt-1 text-xs text-slate-400">{info}</p>}
  </div>
);

// Helper function to round to the nearest 10th of a cent (3 decimal places)
const roundToNearestTenthCent = (value: number): number => {
  if (isNaN(value) || !isFinite(value)) return 0; // Or handle as an error/NaN as appropriate
  return Math.round(value * 1000) / 1000;
};

const ProrateCalculatorPage: React.FC = () => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [totalCostStr, setTotalCostStr] = useState<string>('');
  const [startDateStr, setStartDateStr] = useState<string>(today);
  const [calculationDateStr, setCalculationDateStr] = useState<string>(today);

  const [daysInSubscriptionMonth, setDaysInSubscriptionMonth] = useState<number | null>(null);
  const [dailyCost, setDailyCost] = useState<number | null>(null);
  const [daysUsed, setDaysUsed] = useState<number | null>(null);
  const [proratedCost, setProratedCost] = useState<number | null>(null);
  const [proratedRemaining, setProratedRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number | null) => {
    if (value === null || isNaN(value)) return 'N/A';
    // Display with 3 decimal places for "nearest 10th cent"
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 3, maximumFractionDigits: 3 });
  };

  const handleCalculate = useCallback(() => {
    setError(null);
    setDaysInSubscriptionMonth(null);
    setDailyCost(null);
    setDaysUsed(null);
    setProratedCost(null);
    setProratedRemaining(null);

    const totalCost = parseFloat(totalCostStr); // This is the exact input
    if (isNaN(totalCost) || totalCost <= 0) {
      setError('Please enter a valid Total Monthly Subscription Cost (positive number).');
      return;
    }

    if (!startDateStr) {
        setError('Please select a Subscription Start Date.');
        return;
    }
    if (!calculationDateStr) {
        setError('Please select a Calculation Date.');
        return;
    }
    
    const startDateObj = new Date(startDateStr + 'T00:00:00Z');
    const calcDateObj = new Date(calculationDateStr + 'T00:00:00Z');

    if (isNaN(startDateObj.getTime())) {
        setError('Invalid Subscription Start Date.');
        return;
    }
    if (isNaN(calcDateObj.getTime())) {
        setError('Invalid Calculation Date.');
        return;
    }

    if (calcDateObj < startDateObj) {
      setError('Calculation Date cannot be before Subscription Start Date.');
      return;
    }

    const startYear = startDateObj.getUTCFullYear();
    const startMonth = startDateObj.getUTCMonth(); 
    const startDayOfMonth = startDateObj.getUTCDate();

    const calculatedDaysInMonth = new Date(Date.UTC(startYear, startMonth + 1, 0)).getUTCDate();
    setDaysInSubscriptionMonth(calculatedDaysInMonth);

    if (calculatedDaysInMonth <=0) {
        setError('Could not determine days in subscription month.');
        return;
    }

    const rawDailyCost = totalCost / calculatedDaysInMonth;
    const calculatedDailyCost = roundToNearestTenthCent(rawDailyCost);
    setDailyCost(calculatedDailyCost);

    let calculatedDaysUsedInStartMonth;
    if (calcDateObj.getUTCFullYear() === startYear && calcDateObj.getUTCMonth() === startMonth) {
        calculatedDaysUsedInStartMonth = calcDateObj.getUTCDate() - startDayOfMonth + 1;
    } else {
      calculatedDaysUsedInStartMonth = calculatedDaysInMonth - startDayOfMonth + 1;
    }
    setDaysUsed(calculatedDaysUsedInStartMonth);

    const rawProratedCost = calculatedDailyCost * calculatedDaysUsedInStartMonth;
    const calculatedProratedCost = roundToNearestTenthCent(rawProratedCost);
    setProratedCost(calculatedProratedCost);

    const rawProratedRemaining = totalCost - calculatedProratedCost;
    const calculatedProratedRemaining = roundToNearestTenthCent(rawProratedRemaining);
    setProratedRemaining(calculatedProratedRemaining);

  }, [totalCostStr, startDateStr, calculationDateStr]);

  const ResultDisplay: React.FC<{label: string, value: string | number | null, isCurrency?: boolean, testId?: string}> = 
    ({label, value, isCurrency = false, testId}) => (
    <div className="flex justify-between items-center py-2 px-3 bg-slate-700/50 rounded-md" data-testid={testId}>
      <span className="text-slate-300 text-sm sm:text-base">{label}:</span>
      <span className="text-sky-300 font-semibold text-sm sm:text-base">
        {isCurrency ? formatCurrency(typeof value === 'string' ? parseFloat(value) : value) : (value !== null ? value : 'N/A')}
      </span>
    </div>
  );

  return (
    <section aria-labelledby="prorate-calculator-title" className="w-full max-w-lg bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700">
      <h2 id="prorate-calculator-title" className="text-2xl sm:text-3xl font-bold text-sky-300 mb-6 text-center">
        Prorate Subscription (Calendar Based)
      </h2>
      
      <div className="space-y-5">
        <InputField 
          id="totalCost"
          label="Total Monthly Subscription Cost"
          value={totalCostStr}
          onChange={setTotalCostStr}
          placeholder="e.g., 50.00"
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
        />
        <InputField
          id="startDate"
          label="Subscription Start Date"
          value={startDateStr}
          onChange={setStartDateStr}
          placeholder=""
          type="date"
          info="The date the subscription period began."
        />
        <InputField
          id="calculationDate"
          label="Calculation Date"
          value={calculationDateStr}
          onChange={setCalculationDateStr}
          placeholder=""
          type="date"
          min={startDateStr} 
          info="The date for which to calculate the proration."
        />
      </div>

      <button
        onClick={handleCalculate}
        className="mt-8 w-full px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out flex items-center justify-center"
        aria-controls="calculation-results"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v2a1 1 0 01-1 1h-.226A6.953 6.953 0 0010 15.5c-1.256 0-2.44-.323-3.463-.881V16.5a1.5 1.5 0 01-3 0V3.5a1.5 1.5 0 013 0zM11.5 5.5h-3V3.5a.5.5 0 011 0V4h1V3.5a.5.5 0 011 0v2z"/>
          <path d="M3.793 6.023A6.474 6.474 0 003 9.75c0 2.784 1.706 5.162 4.128 6.052A3.501 3.501 0 013 16.5V15a1 1 0 00-1-1H1a1 1 0 01-1-1V9a1 1 0 011-1h1a1 1 0 011 1v.226A6.953 6.953 0 003.793 6.023zM10 14a4.978 4.978 0 005-5H5a4.978 4.978 0 005 5z"/>
        </svg>
        Calculate Proration
      </button>

      {error && (
        <div role="alert" className="mt-6 p-3 bg-red-700/40 border border-red-600 text-red-300 rounded-lg text-sm">
          <p className="font-semibold mb-1">Error</p>
          <p>{error}</p>
        </div>
      )}

      {(proratedRemaining !== null || dailyCost !== null) && !error && (
        <div id="calculation-results" className="mt-8 pt-6 border-t border-slate-700 space-y-3" aria-live="polite">
            <h3 className="text-lg font-semibold text-sky-400 mb-2">Calculation Results (for Start Month):</h3>
            <ResultDisplay label="Days in Subscription Start Month" value={daysInSubscriptionMonth} />
            <ResultDisplay label="Daily Subscription Cost" value={dailyCost} isCurrency={true} testId="daily-cost" />
            <ResultDisplay label="Days Used (in start month)" value={daysUsed} testId="days-used" />
            <ResultDisplay label="Prorated Cost (for used days)" value={proratedCost} isCurrency={true} testId="prorated-cost" />
            <ResultDisplay label="Prorated Amount Remaining" value={proratedRemaining} isCurrency={true} testId="prorated-remaining" />
        </div>
      )}
    </section>
  );
};

export default ProrateCalculatorPage;
    