import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Check, X, AlertCircle, ZoomIn, ZoomOut, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ViolationDetails = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-4">
        <Link to="/dashboard/result">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-border hover:bg-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Violation Review</h1>
          <p className="text-content-muted mt-1">Review flagged AI detection to confirm or reject.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Evidence Explorer */}
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base">Evidence Image</CardTitle>
            <div className="flex space-x-2">
              <Button variant="secondary" size="icon" className="w-8 h-8"><ZoomOut className="w-4 h-4" /></Button>
              <Button variant="secondary" size="icon" className="w-8 h-8"><ZoomIn className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full h-full">
                {/* Simulated zoomed-in label image */}
                <img 
                  src="https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80" 
                  alt="Zoomed label"
                  className="w-full h-full object-cover rounded-lg opacity-80"
                  style={{ objectPosition: 'center 70%' }}
                />
                
                {/* Highlight bounding box */}
                <div className="absolute top-[60%] left-[20%] w-[60%] h-[30%] border-4 border-danger bg-danger/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] z-10" />
                <div className="absolute top-[53%] left-[20%] bg-danger text-white px-2 py-1 text-xs font-bold z-20 rounded-t-md shadow-lg">
                  Detected Region: Date
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Violation Details */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-content">Missing Date of Packaging</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="danger">High Severity</Badge>
                    <Badge variant="info">AI Confidence: 89%</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-2">Rule Reference</h4>
                  <div className="bg-surface-light border border-border p-4 rounded-xl text-sm">
                    <span className="font-bold">Rule 6(1)(f):</span> Every package shall bear the name of the month and the year in which the commodity is manufactured or pre-packed or imported.
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-2">AI Analysis</h4>
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-sm text-rose-800">
                    The highlighted region contains smudged/unreadable text where the packaging date is typically expected. OCR extraction failed to detect a valid month/year format.
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-2">Inspector Notes</h4>
                  <textarea 
                    className="w-full h-24 p-3 bg-surface-light border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    placeholder="Add your remarks regarding this violation..."
                  ></textarea>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
              <Button variant="danger" className="flex-1" size="lg" leftIcon={<Check className="w-5 h-5" />}>
                Confirm Violation
              </Button>
              <Button variant="secondary" className="flex-1" size="lg" leftIcon={<X className="w-5 h-5" />}>
                Mark as False Positive
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
