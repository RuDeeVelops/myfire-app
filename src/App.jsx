import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart2,
  Table,
  Sun,
  Moon,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "./ThemeContext";

//==== Utility Functions ====================================================

const currencyFormatter = (currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

//==== Component: Currency Dropdown =========================================

const CurrencyDropdown = ({ currency, setCurrency }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex w-full justify-center underline hover:decoration-orange-400 focus:outline-none"
      >
        {currency.toLowerCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {currencies.map((curr) => (
              <button
                key={curr}
                onClick={() => {
                  setCurrency(curr);
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                role="menuitem"
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

//==== Core Calculation Function ============================================

const calculateProjection = (initialValue, roi, selectedSWR) => {
  const annualReturn = roi / 100;
  const inflationRate = 0.03; // 3% inflation
  const currentYear = new Date().getFullYear();

  let currentValue = initialValue;
  let currentMonthlySpending = (initialValue * selectedSWR) / 12;
  const data = [];
  let yearsLasting = 0;
  let peakValue = initialValue;
  let peakYear = currentYear;
  let isEternal = true;

  for (let year = currentYear; year <= currentYear + 99; year++) {
    if (year > currentYear) {
      currentMonthlySpending *= 1 + inflationRate;
    }

    data.push({
      year,
      portfolioValue: Math.round(currentValue),
      monthlySpending: Math.round(currentMonthlySpending),
    });

    if (currentValue > peakValue) {
      peakValue = currentValue;
      peakYear = year;
    }

    currentValue =
      currentValue * (1 + annualReturn) - currentMonthlySpending * 12;

    if (currentValue <= 0) {
      isEternal = false;
      break;
    }

    yearsLasting = year - currentYear + 1;
  }

  isEternal = isEternal && data[99].portfolioValue > data[98].portfolioValue;

  return {
    data,
    yearsLasting,
    peakValue,
    peakYear,
    isEternal,
    initialMonthlySpending: data[0].monthlySpending,
  };
};

//==== Component: Dark Mode Toggle ==========================================

const DarkModeToggle = () => {
  const { isDarkMode, setIsDarkMode } = useTheme();

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="fixed right-4 top-4 rounded-full bg-gray-200 p-2 text-gray-700 hover:text-orange-500 dark:bg-gray-700 dark:text-orange-500 dark:hover:text-orange-400"
    >
      {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
};

//==== Main App Component ===================================================

const App = () => {
  const [netWorth, setNetWorth] = useState("");
  const [formattedNetWorth, setFormattedNetWorth] = useState("");
  const [yearlyReturn, setYearlyReturn] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [selectedSWR, setSelectedSWR] = useState(null);
  const [projectionResults, setProjectionResults] = useState(null);
  const [view, setView] = useState("chart");
  const [showAbout, setShowAbout] = useState(false);
  const { isDarkMode } = useTheme();
  const [isYearlyReturnActive, setIsYearlyReturnActive] = useState(false);

  //---- Effect for Calculating Projections ---------------------------------

  useEffect(() => {
    if (netWorth && yearlyReturn) {
      const results = {
        "1%": calculateProjection(Number(netWorth), Number(yearlyReturn), 0.01),
        "3%": calculateProjection(Number(netWorth), Number(yearlyReturn), 0.03),
        "4%": calculateProjection(Number(netWorth), Number(yearlyReturn), 0.04),
      };
      setProjectionResults(results);
    }
  }, [netWorth, yearlyReturn]);

  //---- Animation Configuration --------------------------------------------

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  //---- Helper Functions for Yearly Return Input ---------------------------

  const incrementYearlyReturn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setYearlyReturn((prev) => Math.min(10000, Number(prev) + 1).toString());
  };

  const decrementYearlyReturn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setYearlyReturn((prev) => Math.max(0, Number(prev) - 1).toString());
  };

  //---- Main Render Function -----------------------------------------------

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-t from-white to-orange-100/20 p-8 antialiased transition-colors duration-200 dark:from-gray-900 dark:to-gray-800">
      <div className="flex w-full justify-between">
        <button
          onClick={() => setShowAbout(true)}
          className="fixed left-4 top-4 rounded-full bg-gray-200 p-2 text-gray-700 hover:text-orange-500 dark:bg-gray-700 dark:text-gray-400 dark:hover:text-orange-400"
        >
          <Info size={24} />
        </button>
        <DarkModeToggle />
      </div>

      {/* Main Content Area */}

      <motion.div
        className="w-full max-w-3xl space-y-12"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.3 } },
        }}
      >
        <motion.h1
          className="mb-16 text-center text-6xl text-gray-800 dark:text-white"
          variants={fadeIn}
        >
          Can I be financially free?
        </motion.h1>

        {/* Input Section */}

        <motion.div
          variants={fadeIn}
          className="text-center text-2xl leading-relaxed text-slate-600 dark:text-slate-300"
        >
          <div>
            If I were to retire today with{" "}
            <input
              type="text"
              value={formattedNetWorth}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                if (value) {
                  const numericValue = parseInt(value, 10);
                  setNetWorth(numericValue);
                  setFormattedNetWorth(
                    currencyFormatter(currency).format(numericValue),
                  );
                } else {
                  setNetWorth("");
                  setFormattedNetWorth("");
                }
              }}
              className="no-spinner mb-2 w-40 rounded-3xl bg-transparent px-2 py-0 outline-none ring-2 ring-gray-200 hover:ring-orange-200/50 focus:ring-orange-400 dark:ring-gray-700 dark:hover:ring-orange-500/50 dark:focus:ring-orange-500"
              placeholder={`Enter amount`}
            />{" "}
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} />,
          </div>

          <p>
            and my yearly return on investment is{" "}
            <div className="relative inline-flex items-center">
              <input
                type="number"
                value={yearlyReturn}
                onChange={(e) => setYearlyReturn(e.target.value)}
                onFocus={() => setIsYearlyReturnActive(true)}
                onBlur={(e) => {
                  // Delay hiding the chevrons to allow for button clicks
                  setTimeout(() => {
                    if (!e.currentTarget.contains(document.activeElement)) {
                      setIsYearlyReturnActive(false);
                    }
                  }, 0);
                }}
                className="no-spinner mb-2 flex w-20 items-center rounded-3xl bg-transparent px-2 py-0 pr-8 outline-none ring-2 ring-gray-200 hover:ring-orange-200/50 focus:ring-orange-400 dark:ring-gray-700 dark:hover:ring-orange-500/50 dark:focus:ring-orange-500"
                placeholder="%"
              />
              {isYearlyReturnActive && (
                <div className="absolute bottom-3.5 right-3 flex flex-col justify-center align-middle">
                  <button
                    onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                    onClick={incrementYearlyReturn}
                    className="text-gray-400 hover:text-orange-500 focus:outline-none dark:text-gray-500 dark:hover:text-orange-400"
                    aria-label="Increase percentage"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                    onClick={decrementYearlyReturn}
                    className="text-gray-400 hover:text-orange-500 focus:outline-none dark:text-gray-500 dark:hover:text-orange-400"
                    aria-label="Decrease percentage"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              )}
            </div>{" "}
            %...
          </p>
        </motion.div>

        {/* Results Display Section */}

        {projectionResults && (
          <motion.div
            variants={fadeIn}
            className="text-center text-2xl leading-relaxed text-slate-600 dark:text-slate-300"
          >
            <p>
              Now let's{" "}
              <span className="font-bold dark:text-gray-50">choose</span> to
              withdraw, every month:
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              {["1%", "3%", "4%"].map((swr) => (
                <button
                  key={swr}
                  onClick={() => setSelectedSWR(swr)}
                  className={`rounded-3xl px-4 py-2 ring-2 transition-all ${
                    selectedSWR === swr
                      ? "bg-orange-500 text-white ring-orange-500"
                      : "bg-gray-200 ring-gray-200 hover:ring-orange-200 dark:bg-gray-700 dark:ring-gray-700 dark:hover:ring-orange-500"
                  }`}
                >
                  {currencyFormatter(currency).format(
                    projectionResults[swr].initialMonthlySpending,
                  )}
                  <span className="block text-sm">{swr} SWR</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {selectedSWR && projectionResults && (
          <motion.div
            variants={fadeIn}
            className="text-center text-2xl leading-relaxed text-slate-600 dark:text-slate-300"
          >
            {projectionResults[selectedSWR].isEternal ? (
              <>
                <p className="font-bold dark:text-gray-50">
                  Wow! My portfolio will{" "}
                  <span className="font-bold text-orange-500 dark:text-orange-400">
                    keep growing indefinitely!
                  </span>
                </p>
                <p>
                  In{" "}
                  <span className="font-bold dark:text-gray-50">
                    {new Date().getFullYear() + 5}
                  </span>
                  , it will be worth{" "}
                  <span className="font-bold dark:text-gray-50">
                    {currencyFormatter(currency).format(
                      projectionResults[selectedSWR].data[5].portfolioValue,
                    )}
                  </span>
                  ,
                  <br />
                  in{" "}
                  <span className="font-bold dark:text-gray-50">
                    {new Date().getFullYear() + 10}
                  </span>
                  , it's gonna blast through{" "}
                  <span className="font-bold dark:text-gray-50">
                    {currencyFormatter(currency).format(
                      projectionResults[selectedSWR].data[10].portfolioValue,
                    )}
                  </span>
                  ,
                  <br />
                  and in{" "}
                  <span className="font-bold dark:text-gray-50">
                    {" "}
                    {new Date().getFullYear() + 30}
                  </span>
                  , it will skyrocket to a whopping{" "}
                  <span className="font-bold dark:text-gray-50">
                    {currencyFormatter(currency).format(
                      projectionResults[selectedSWR].data[30].portfolioValue,
                    )}
                  </span>
                  !
                </p>
              </>
            ) : (
              <>
                <p>
                  But my portfolio would only last for{" "}
                  <span className="font-bold dark:text-gray-50">
                    {projectionResults[selectedSWR].yearsLasting} years
                  </span>
                  ,
                </p>
                <p>
                  reaching a peak of{" "}
                  <span className="font-bold dark:text-gray-50">
                    {currencyFormatter(currency).format(
                      projectionResults[selectedSWR].peakValue,
                    )}
                  </span>{" "}
                  in{" "}
                  <span className="font-bold dark:text-gray-50">
                    {projectionResults[selectedSWR].peakYear}
                  </span>
                  .
                </p>
                <p>
                  Let's{" "}
                  <span className="font-bold dark:text-gray-50">
                    increase returns
                  </span>{" "}
                  or{" "}
                  <span className="font-bold dark:text-gray-50">
                    lower the withdrawal
                  </span>{" "}
                  to make it last forever!
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Chart and Table View Section */}

        {selectedSWR && projectionResults && (
          <motion.div variants={fadeIn} className="space-y-8">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setView("chart")}
                className={`flex items-center rounded-3xl px-4 py-2 ring-2 transition-all ${
                  view === "chart"
                    ? "bg-orange-500 text-white ring-orange-500 hover:ring-orange-500 dark:ring-orange-500 dark:hover:ring-orange-500"
                    : "bg-gray-200 ring-gray-200 hover:ring-orange-200 dark:bg-gray-700 dark:ring-gray-700 dark:hover:ring-orange-500"
                }`}
              >
                <BarChart2 className="mr-2" />
                <span>Chart</span>
              </button>
              <button
                onClick={() => setView("table")}
                className={`flex items-center rounded-3xl px-4 py-2 ring-2 transition-all ${
                  view === "table"
                    ? "bg-orange-500 text-white ring-orange-500 hover:ring-orange-500 dark:ring-orange-500 dark:hover:ring-orange-500"
                    : "bg-gray-200 ring-gray-200 hover:ring-orange-200 dark:bg-gray-700 dark:ring-gray-700 dark:hover:ring-orange-500"
                }`}
              >
                <Table className="mr-2" />
                <span>Table</span>
              </button>
            </div>

            {view === "chart" && (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={projectionResults[selectedSWR].data}
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="year"
                      stroke={isDarkMode ? "#9ca3af" : "#4b5563"}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        currencyFormatter(currency).format(value)
                      }
                      stroke={isDarkMode ? "#9ca3af" : "#4b5563"}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                        borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                      }}
                      labelStyle={{ color: isDarkMode ? "#e5e7eb" : "#1f2937" }}
                      formatter={(value, name) => [
                        currencyFormatter(currency).format(value),
                        name,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="portfolioValue"
                      stroke={isDarkMode ? "#60a5fa" : "#8884d8"}
                      name="Portfolio Value"
                    />
                    <Line
                      type="monotone"
                      dataKey="monthlySpending"
                      stroke={isDarkMode ? "#f97316" : "#f97316"}
                      name="Monthly Salary"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {view === "table" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="p-2 dark:text-gray-50">Year</th>
                      <th className="p-2 dark:text-gray-50">Portfolio Value</th>
                      <th className="p-2 dark:text-gray-50">
                        Monthly Withdrawal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectionResults[selectedSWR].data.map((data, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : ""
                        }
                      >
                        <td className="p-2">{data.year}</td>
                        <td className="p-2">
                          {currencyFormatter(currency).format(
                            data.portfolioValue,
                          )}
                        </td>
                        <td className="p-2">
                          {currencyFormatter(currency).format(
                            data.monthlySpending,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}

      <footer className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Created by{" "}
        <a
          href="https://bento.me/3drudy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-orange-500 dark:hover:text-orange-400"
        >
          Rodolfo Fanti
        </a>{" "}
        | Inspired by{" "}
        <a
          href="https://www.mrmoneymustache.com/2012/05/29/how-much-do-i-need-for-retirement/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-orange-500 dark:hover:text-orange-400"
        >
          Mr. Money Mustache
        </a>{" "}
      </footer>

      {/* About Modal */}

      {showAbout && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl">About This Tool</h2>
            <p>
              This calculator helps you determine if you can achieve financial
              freedom, retire early and live off your investment income.
            </p>
            <br />
            <p>
              In an ideal world, with an average yearly 7% return on investment{" "}
              <span className="font-bold">(eg.: S&P500)</span>, you can withdraw
              up to 4% of your initial portfolio value each year and it will
              last forever.
            </p>
            <br />
            <p className="mt-2">
              It's based on the concept of Safe Withdrawal Rate, adjusted for 3%
              inflation (this is why withdrawals increase every year).{" "}
            </p>
            <br />
            <p className="mt-2 font-bold">
              Remember: This app is for educational purposes only and not
              financial advice.
              <br />
              Reality is way more chaotic.
            </p>
            <button
              onClick={() => setShowAbout(false)}
              className="hover:bg-orangering-orange-500 mt-4 block w-full rounded bg-orange-500 px-4 py-2 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
