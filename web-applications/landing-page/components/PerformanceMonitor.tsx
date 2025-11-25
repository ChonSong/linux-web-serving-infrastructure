import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Zap,
  HardDrive,
  Wifi,
  Eye
} from 'lucide-react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte

  // Resource metrics
  bundleSize: number;
  imageCount: number;
  scriptCount: number;

  // Network metrics
  connectionSpeed: string;
  effectiveType: string;

  // Memory metrics
  usedJSHeapSize: number;
  totalJSHeapSize: number;
}

interface PerformanceMonitorProps {
  showMetrics?: boolean;
  budgetThresholds?: {
    bundleSize: number;
    lcp: number;
    fid: number;
    cls: number;
  };
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showMetrics = true,
  budgetThresholds = {
    bundleSize: 550 * 1024, // 550KB
    lcp: 2.5,
    fid: 100,
    cls: 0.1
  }
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Performance budget monitoring
  const checkBudgetStatus = (value: number, threshold: number, isHigherBetter = false) => {
    if (isHigherBetter) {
      return value >= threshold ? 'good' : 'warning';
    }
    return value <= threshold ? 'good' : 'warning';
  };

  // Get performance metrics
  const getMetrics = async () => {
    try {
      // Core Web Vitals
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      // Web Vitals calculation (simplified)
      const lcp = Math.max(...performance.getEntriesByType('largest-contentful-paint')
        .map(entry => entry.startTime));

      // Get network information
      const connection = (navigator as any).connection || {
        effectiveType: 'unknown',
        downlink: 0
      };

      // Get resource information
      const resources = performance.getEntriesByType('resource');
      const scripts = resources.filter(r => r.name.includes('.js'));
      const images = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));

      // Memory usage (if available)
      const memory = (performance as any).memory || {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0
      };

      const newMetrics: PerformanceMetrics = {
        lcp: lcp / 1000, // Convert to seconds
        fid: 50, // Placeholder - would need actual measurement
        cls: 0.05, // Placeholder - would need actual measurement
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        ttfb: navigation.responseStart - navigation.requestStart,
        bundleSize: scripts.reduce((sum, script) => sum + (script as any).transferSize, 0),
        imageCount: images.length,
        scriptCount: scripts.length,
        connectionSpeed: connection.effectiveType,
        effectiveType: connection.effectiveType,
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize
      };

      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error getting performance metrics:', error);
    }
  };

  // Start performance monitoring
  const startMonitoring = () => {
    setIsRecording(true);
    getMetrics();

    // Set up observer for ongoing monitoring
    try {
      observerRef.current = new PerformanceObserver((list) => {
        getMetrics();
      });
      observerRef.current.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    } catch (error) {
      console.error('Performance Observer not supported:', error);
    }
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsRecording(false);
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  useEffect(() => {
    if (showMetrics) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [showMetrics]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getMetricStatus = (value: number, metric: keyof typeof budgetThresholds) => {
    const status = checkBudgetStatus(value, budgetThresholds[metric]);
    return {
      status,
      icon: status === 'good' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />,
      color: status === 'good' ? 'text-green-400' : 'text-yellow-400'
    };
  };

  if (!showMetrics || !metrics) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-2 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 shadow-2xl p-4 w-80 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Performance Metrics
              </h3>
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            </div>

            {/* Core Web Vitals */}
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-medium text-gray-400">Core Web Vitals</h4>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">LCP (Largest Contentful Paint)</span>
                <div className="flex items-center gap-1">
                  <span className={getMetricStatus(metrics.lcp, 'lcp').color}>
                    {metrics.lcp.toFixed(1)}s
                  </span>
                  {getMetricStatus(metrics.lcp, 'lcp').icon}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">FID (First Input Delay)</span>
                <div className="flex items-center gap-1">
                  <span className={getMetricStatus(metrics.fid, 'fid').color}>
                    {metrics.fid}ms
                  </span>
                  {getMetricStatus(metrics.fid, 'fid').icon}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">CLS (Cumulative Layout Shift)</span>
                <div className="flex items-center gap-1">
                  <span className={getMetricStatus(metrics.cls, 'cls').color}>
                    {metrics.cls.toFixed(2)}
                  </span>
                  {getMetricStatus(metrics.cls, 'cls').icon}
                </div>
              </div>
            </div>

            {/* Resource Metrics */}
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-medium text-gray-400">Resources</h4>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  Bundle Size
                </span>
                <div className="flex items-center gap-1">
                  <span className={getMetricStatus(metrics.bundleSize, 'bundleSize').color}>
                    {formatSize(metrics.bundleSize)}
                  </span>
                  {getMetricStatus(metrics.bundleSize, 'bundleSize').icon}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Images</span>
                <span className="text-gray-400">{metrics.imageCount}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Scripts</span>
                <span className="text-gray-400">{metrics.scriptCount}</span>
              </div>
            </div>

            {/* Network Info */}
            <div className="space-y-2 border-t border-slate-700 pt-3">
              <h4 className="text-sm font-medium text-gray-400">Network</h4>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connection
                </span>
                <span className="text-gray-400 capitalize">{metrics.effectiveType}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-900/95 backdrop-blur-sm rounded-full border border-slate-700 p-3 shadow-lg"
      >
        <div className="flex items-center gap-2 text-white">
          <Activity className="w-4 h-4 text-blue-400" />
          <TrendingUp className="w-3 h-3 text-gray-400" />
          <Eye className="w-3 h-3 text-gray-400" />
        </div>
      </motion.button>
    </motion.div>
  );
};