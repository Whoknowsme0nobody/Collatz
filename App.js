import React, { useState } from 'react';

const CollatzExperiment = () => {
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedX, setSelectedX] = useState(2);
  const [maxIterations, setMaxIterations] = useState(1000);

  const generalizedCollatz = (n, x, maxIter = 1000) => {
    const sequence = [n];
    let current = n;
    let iterations = 0;
    let currentX = x;
    let algorithmSwitches = 0;
    const maxSwitches = 5;
    
    while (current !== 1 && iterations < maxIter && algorithmSwitches < maxSwitches) {
      const beforeValue = current;
      
      if (current % currentX === 0) {
        current = current / currentX;
      } else {
        if (currentX === 2) {
          current = 3 * current + 1;
        } else {
          const beta = current % currentX;
          let alpha;
          
          if (beta <= currentX / 2) {
            alpha = -beta;
          } else {
            alpha = currentX - beta;
          }
          
          const adjustment = Math.floor((current + alpha) / currentX);
          current = current + adjustment;
        }
        
        if (current <= 0) {
          if (currentX >= 4 && algorithmSwitches < maxSwitches) {
            algorithmSwitches++;
            current = beforeValue;
            
            if (currentX >= 50) currentX = 2;
            else if (currentX >= 20) currentX = 3;
            else if (currentX >= 10) currentX = 2;
            else if (currentX === 9) currentX = 3;
            else if (currentX === 8) currentX = 4;
            else if (currentX === 7) currentX = 3;
            else if (currentX === 6) currentX = 3;
            else if (currentX === 5) currentX = 2;
            else if (currentX === 4) currentX = 3;
            else if (currentX === 3) currentX = 2;
            else {
              if (current % 2 === 0) {
                current = current / 2;
              } else {
                current = 3 * current + 1;
              }
            }
            continue;
          } else {
            return {
              sequence: sequence,
              converged: false,
              iterations: iterations,
              finalValue: current,
              algorithmSwitches: algorithmSwitches,
              reason: "Reached non-positive value"
            };
          }
        }
      }
      
      sequence.push(current);
      iterations++;
      
      if (sequence.length > 20) {
        const recentSequence = sequence.slice(-20);
        const cycleDetected = recentSequence.slice(0, -1).includes(current);
        
        if (cycleDetected) {
          if (currentX >= 4 && algorithmSwitches < maxSwitches) {
            algorithmSwitches++;
            
            sequence.splice(-5);
            current = sequence[sequence.length - 1];
            
            if (currentX >= 50) currentX = 2;
            else if (currentX >= 20) currentX = 3;
            else if (currentX >= 10) currentX = 2;
            else if (currentX === 9) currentX = 3;
            else if (currentX === 8) currentX = 4;
            else if (currentX === 7) currentX = 3;
            else if (currentX === 6) currentX = 3;
            else if (currentX === 5) currentX = 2;
            else if (currentX === 4) currentX = 3;
            else if (currentX === 3) currentX = 2;
            else currentX = 2;
            continue;
          } else {
            return {
              sequence: sequence,
              converged: false,
              iterations: iterations,
              finalValue: current,
              algorithmSwitches: algorithmSwitches,
              reason: "Detected cycle"
            };
          }
        }
      }
      
      if (current > 50000 && algorithmSwitches < maxSwitches) {
        if (currentX >= 4) {
          algorithmSwitches++;
          if (currentX >= 50) currentX = 2;
          else if (currentX >= 20) currentX = 3;
          else if (currentX >= 10) currentX = 2;
          else if (currentX === 9) currentX = 3;
          else if (currentX === 8) currentX = 4;
          else if (currentX === 7) currentX = 3;
          else if (currentX === 6) currentX = 3;
          else if (currentX === 5) currentX = 2;
          else if (currentX === 4) currentX = 3;
          else currentX = 2;
        }
      }
    }
    
    return {
      sequence: sequence,
      converged: current === 1,
      iterations: iterations,
      finalValue: current,
      algorithmSwitches: algorithmSwitches,
      reason: current === 1 ? "Converged to 1" : 
              algorithmSwitches >= maxSwitches ? "Max algorithm switches reached" :
              "Max iterations reached"
    };
  };

  const runExperiment = () => {
    setIsRunning(true);
    const testResults = [];
    
    // Process in smaller chunks to prevent browser freezing
    const processChunk = (startIndex, chunkSize = 1000) => {
      const endIndex = Math.min(startIndex + chunkSize, 100001);
      
      for (let i = startIndex; i < endIndex; i++) {
        const result = generalizedCollatz(i, selectedX, maxIterations);
        testResults.push({
          startingNumber: i,
          ...result,
          maxValue: Math.max(...result.sequence),
          sequenceLength: result.sequence.length
        });
      }
      
      if (endIndex < 100001) {
        // Process next chunk after a small delay to keep UI responsive
        setTimeout(() => processChunk(endIndex), 10);
      } else {
        setResults(testResults);
        setIsRunning(false);
      }
    };
    
    processChunk(1);
  };

  const getStats = () => {
    if (results.length === 0) return null;
    
    const converged = results.filter(r => r.converged).length;
    const cycles = results.filter(r => r.reason === "Detected cycle").length;
    const maxIter = results.filter(r => r.reason === "Max iterations reached").length;
    const negative = results.filter(r => r.reason === "Reached non-positive value").length;
    const maxSwitches = results.filter(r => r.reason === "Max algorithm switches reached").length;
    
    const avgIterations = results.reduce((sum, r) => sum + r.iterations, 0) / results.length;
    const maxIterations = Math.max(...results.map(r => r.iterations));
    const avgMaxValue = results.reduce((sum, r) => sum + r.maxValue, 0) / results.length;
    const totalSwitches = results.reduce((sum, r) => sum + (r.algorithmSwitches || 0), 0);
    
    return {
      converged,
      cycles,
      maxIter,
      negative,
      maxSwitches,
      avgIterations: avgIterations.toFixed(2),
      maxIterations,
      avgMaxValue: avgMaxValue.toFixed(2),
      totalSwitches
    };
  };

  const stats = getStats();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Generalized Collatz Algorithm Experiment - 100,000 Tests</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Algorithm Parameters</h2>
        <div className="flex gap-4 items-center mb-4">
          <label className="flex items-center gap-2">
            <span>Value of x:</span>
            <select 
              value={selectedX} 
              onChange={(e) => setSelectedX(parseInt(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={2}>2 (Classic Collatz)</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={9}>9</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
              <option value={60}>60</option>
              <option value={70}>70</option>
              <option value={80}>80</option>
              <option value={90}>90</option>
              <option value={100}>100</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span>Max iterations:</span>
            <input 
              type="number" 
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value))}
              className="border rounded px-2 py-1 w-20"
            />
          </label>
          <button 
            onClick={runExperiment}
            disabled={isRunning}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isRunning ? 'Running... (this may take several minutes)' : 'Run Experiment (100K tests)'}
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Hybrid Algorithm with Extended Range:</strong></p>
          <p>• <strong>For x=2:</strong> Classic Collatz (if even: n/2, if odd: 3n+1)</p>
          <p>• <strong>For x>2:</strong> If x divides n: n→n/x, else: β=n mod x, α=±β, then n→n+⌊(n+α)/x⌋</p>
          <p>• <strong>Adaptive switching:</strong> Smart fallback strategy for x=3 to x=100</p>
          <p>• High x values (50+) → x=2, Medium x (20-49) → x=3, Low x → gradual step-down</p>
        </div>
      </div>

      {stats && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-3">Summary Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong>Converged to 1:</strong> {stats.converged}/100,000</div>
            <div><strong>Detected cycles:</strong> {stats.cycles}/100,000</div>
            <div><strong>Max iterations hit:</strong> {stats.maxIter}/100,000</div>
            <div><strong>Went negative:</strong> {stats.negative}/100,000</div>
            <div><strong>Max switches hit:</strong> {stats.maxSwitches}/100,000</div>
            <div><strong>Total algo switches:</strong> {stats.totalSwitches}</div>
            <div><strong>Avg iterations:</strong> {stats.avgIterations}</div>
            <div><strong>Max iterations:</strong> {stats.maxIterations}</div>
            <div><strong>Avg max value:</strong> {stats.avgMaxValue}</div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Analysis Highlights</h3>
            <div className="text-sm space-y-1">
              <div><strong>Success Rate:</strong> {((stats.converged/100000)*100).toFixed(3)}% converged to 1</div>
              <div><strong>Most Problematic Range:</strong> Numbers requiring most switches or failing</div>
              <div><strong>Switching Effectiveness:</strong> {stats.totalSwitches > 0 ? `${stats.totalSwitches} total switches helped recovery` : 'No switches needed'}</div>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-2 py-1">Start</th>
                  <th className="border border-gray-300 px-2 py-1">Converged?</th>
                  <th className="border border-gray-300 px-2 py-1">Iterations</th>
                  <th className="border border-gray-300 px-2 py-1">Final Value</th>
                  <th className="border border-gray-300 px-2 py-1">Max Value</th>
                  <th className="border border-gray-300 px-2 py-1">Switches</th>
                  <th className="border border-gray-300 px-2 py-1">Reason</th>
                  <th className="border border-gray-300 px-2 py-1">Sequence (first 10)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className={result.converged ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="border border-gray-300 px-2 py-1 font-mono">{result.startingNumber}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {result.converged ? '✅' : '❌'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 font-mono">{result.iterations}</td>
                    <td className="border border-gray-300 px-2 py-1 font-mono">{result.finalValue}</td>
                    <td className="border border-gray-300 px-2 py-1 font-mono">{result.maxValue}</td>
                    <td className="border border-gray-300 px-2 py-1 font-mono text-center">{result.algorithmSwitches || 0}</td>
                    <td className="border border-gray-300 px-2 py-1 text-xs">{result.reason}</td>
                    <td className="border border-gray-300 px-2 py-1 font-mono text-xs">
                      {result.sequence.slice(0, 10).join(', ')}
                      {result.sequence.length > 10 ? '...' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Click "Run Experiment" to test your algorithm on numbers 1-100,000
          <br />
          <span className="text-sm text-orange-600">⚠️ Warning: This will test 100,000 numbers and may take some time to complete</span>
        </div>
      )}
    </div>
  );
};

export default CollatzExperiment;
