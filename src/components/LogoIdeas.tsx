import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Download, Copy, Check } from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface LogoIdeasProps {
  onBack: () => void;
}

interface LogoDesign {
  id: string;
  name: string;
  brand: 'LOOCHIA' | 'KOOCAO' | 'COUPSA' | 'COOPUNG';
  style: string;
  description: string;
  component: React.ReactNode;
}

export function LogoIdeas({ onBack }: LogoIdeasProps) {
  const [selectedBrand, setSelectedBrand] = useState<'ALL' | 'LOOCHIA' | 'KOOCAO' | 'COUPSA' | 'COOPUNG'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySVG = (logoId: string, svgElement: React.ReactNode) => {
    // For demo purposes, show success message
    setCopiedId(logoId);
    toast.success('Logo design copied! (SVG code ready for export)');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const logoDesigns: LogoDesign[] = [
    // LOOCHIA LOGOS
    {
      id: 'loochia-1',
      name: 'LOOCHIA Minimal',
      brand: 'LOOCHIA',
      style: 'Clean Wordmark',
      description: 'Clean, minimal wordmark with modern typography',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Simple L icon */}
            <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center mb-3 shadow-lg">
              <span className="text-white dark:text-slate-900 text-xl font-bold tracking-tight">L</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">LOOCHIA</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'loochia-2',
      name: 'LOOCHIA Modern',
      brand: 'LOOCHIA',
      style: 'Geometric Symbol',
      description: 'Modern geometric symbol with clean lines',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Modern circle with L */}
            <div className="w-12 h-12 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center mb-3">
              <span className="text-slate-900 dark:text-white text-xl font-light">L</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-light text-slate-900 dark:text-slate-100 tracking-widest">LOOCHIA</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'loochia-3',
      name: 'LOOCHIA Tech',
      brand: 'LOOCHIA',
      style: 'Tech Minimal',
      description: 'Ultra-minimal tech aesthetic with precise geometry',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Simple square with rounded corner */}
            <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 rounded-xl flex items-center justify-center mb-3 shadow-sm">
              <div className="w-4 h-4 border-l-2 border-b-2 border-white dark:border-slate-900 transform rotate-45"></div>
            </div>
            <div className="text-center">
              <span className="text-lg font-medium text-slate-900 dark:text-slate-100 tracking-wide">LOOCHIA</span>
            </div>
          </div>
        </div>
      )
    },
    
    // KOOCAO LOGOS
    {
      id: 'koocao-1',
      name: 'KOOCAO Minimal',
      brand: 'KOOCAO',
      style: 'Clean Wordmark',
      description: 'Clean, minimal wordmark with bold typography',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Simple K icon */}
            <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center mb-3 shadow-lg">
              <span className="text-white dark:text-slate-900 text-xl font-bold tracking-tight">K</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">KOOCAO</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'koocao-2',
      name: 'KOOCAO Modern',
      brand: 'KOOCAO',
      style: 'Geometric Symbol',
      description: 'Modern geometric symbol with fintech appeal',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Modern diamond shape */}
            <div className="w-12 h-12 border-2 border-slate-900 dark:border-white transform rotate-45 flex items-center justify-center mb-3">
              <div className="w-6 h-6 bg-slate-900 dark:bg-white transform -rotate-45 rounded-sm"></div>
            </div>
            <div className="text-center">
              <span className="text-lg font-light text-slate-900 dark:text-slate-100 tracking-widest">KOOCAO</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'koocao-3',
      name: 'KOOCAO Tech',
      brand: 'KOOCAO',
      style: 'Tech Minimal',
      description: 'Ultra-minimal fintech aesthetic with modern appeal',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Simple rounded rectangle stack */}
            <div className="relative w-12 h-12 mb-3">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 rounded-xl shadow-sm"></div>
              <div className="absolute top-1 left-1 right-1 bottom-1 border border-white dark:border-slate-900 rounded-lg"></div>
            </div>
            <div className="text-center">
              <span className="text-lg font-medium text-slate-900 dark:text-slate-100 tracking-wide">KOOCAO</span>
            </div>
          </div>
        </div>
      )
    },
    
    // COUPSA LOGOS
    {
      id: 'coupasa-1',
      name: 'COUPSA Minimal',
      brand: 'COUPSA',
      style: 'Clean Wordmark',
      description: 'Clean, minimal wordmark with modern typography',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Simple C icon */}
            <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center mb-3 shadow-lg">
              <span className="text-white dark:text-slate-900 text-xl font-bold tracking-tight">C</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">COUPSA</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'coupasa-2',
      name: 'COUPSA Modern',
      brand: 'COUPSA',
      style: 'Geometric Symbol',
      description: 'Modern geometric symbol with clean lines',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Modern circle with C */}
            <div className="w-12 h-12 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center mb-3">
              <span className="text-slate-900 dark:text-white text-xl font-light">C</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-light text-slate-900 dark:text-slate-100 tracking-widest">COUPSA</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'coupasa-3',
      name: 'COUPSA Tech',
      brand: 'COUPSA',
      style: 'Tech Minimal',
      description: 'Ultra-minimal tech aesthetic with precise geometry',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Simple square with rounded corner */}
            <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 rounded-xl flex items-center justify-center mb-3 shadow-sm">
              <div className="w-4 h-4 border-l-2 border-b-2 border-white dark:border-slate-900 transform rotate-45"></div>
            </div>
            <div className="text-center">
              <span className="text-lg font-medium text-slate-900 dark:text-slate-100 tracking-wide">COUPSA</span>
            </div>
          </div>
        </div>
      )
    },

    // COOPUNG LOGOS
    {
      id: 'coopung-1',
      name: 'COOPUNG Minimal',
      brand: 'COOPUNG',
      style: 'Clean Wordmark',
      description: 'Clean, minimal wordmark with cooperation theme',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Interlocking circles representing cooperation */}
            <div className="w-12 h-12 flex items-center justify-center mb-3 relative">
              <div className="w-6 h-6 border-2 border-slate-900 dark:border-white rounded-full"></div>
              <div className="w-6 h-6 border-2 border-slate-900 dark:border-white rounded-full -ml-2"></div>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">COOPUNG</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'coopung-2',
      name: 'COOPUNG Modern',
      brand: 'COOPUNG',
      style: 'Cooperative Symbol',
      description: 'Modern symbol representing cooperation and unity',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Three overlapping circles in triangular formation */}
            <div className="w-12 h-12 flex items-center justify-center mb-3 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-900 dark:bg-white rounded-full opacity-80"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-slate-900 dark:bg-white rounded-full opacity-60"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-slate-900 dark:bg-white rounded-full opacity-60"></div>
            </div>
            <div className="text-center">
              <span className="text-lg font-light text-slate-900 dark:text-slate-100 tracking-widest">COOPUNG</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'coopung-3',
      name: 'COOPUNG Tech',
      brand: 'COOPUNG',
      style: 'Tech Minimal',
      description: 'Ultra-minimal tech aesthetic with connection theme',
      component: (
        <div className="w-32 h-32 mx-auto relative">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Connected nodes design */}
            <div className="w-12 h-12 flex items-center justify-center mb-3 relative">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white dark:bg-slate-900 rounded-full"></div>
                  <div className="w-3 h-0.5 bg-white dark:bg-slate-900 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white dark:bg-slate-900 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <span className="text-lg font-medium text-slate-900 dark:text-slate-100 tracking-wide">COOPUNG</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredLogos = selectedBrand === 'ALL' ? logoDesigns : logoDesigns.filter(logo => logo.brand === selectedBrand);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40 hover:bg-white/90 dark:hover:bg-slate-900/90"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Logo Ideas</h1>
              <p className="text-slate-600 dark:text-slate-400">Branding concepts for LOOCHIA, KOOCAO, COUPSA, and COOPUNG</p>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={() => setSelectedBrand('ALL')}
              variant={selectedBrand === 'ALL' ? 'default' : 'outline'}
              className={selectedBrand === 'ALL' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40'
              }
            >
              All Logos
            </Button>
            <Button
              onClick={() => setSelectedBrand('LOOCHIA')}
              variant={selectedBrand === 'LOOCHIA' ? 'default' : 'outline'}
              className={selectedBrand === 'LOOCHIA' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40'
              }
            >
              LOOCHIA Only
            </Button>
            <Button
              onClick={() => setSelectedBrand('KOOCAO')}
              variant={selectedBrand === 'KOOCAO' ? 'default' : 'outline'}
              className={selectedBrand === 'KOOCAO' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40'
              }
            >
              KOOCAO Only
            </Button>
            <Button
              onClick={() => setSelectedBrand('COUPSA')}
              variant={selectedBrand === 'COUPSA' ? 'default' : 'outline'}
              className={selectedBrand === 'COUPSA' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40'
              }
            >
              COUPSA Only
            </Button>
            <Button
              onClick={() => setSelectedBrand('COOPUNG')}
              variant={selectedBrand === 'COOPUNG' ? 'default' : 'outline'}
              className={selectedBrand === 'COOPUNG' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40'
              }
            >
              COOPUNG Only
            </Button>
          </div>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLogos.map((logo) => (
            <div key={logo.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-slate-700/40 shadow-xl shadow-black/5 p-8">
              {/* Logo Display */}
              <div className="mb-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
                {logo.component}
              </div>
              
              {/* Logo Info */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{logo.name}</h3>
                  <Badge 
                    className={logo.brand === 'LOOCHIA' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                      : logo.brand === 'KOOCAO'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : logo.brand === 'COUPSA'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    }
                  >
                    {logo.brand}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{logo.style}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">{logo.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleCopySVG(logo.id, logo.component)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  {copiedId === logo.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy SVG
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40"
                  onClick={() => toast.info('Download feature coming soon!')}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-slate-700/40 shadow-xl shadow-black/5 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">About These Designs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3">LOOCHIA Concepts</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                LOOCHIA logos focus on discovery and exploration themes, using lens and flow elements to represent finding and discovering opportunities.
              </p>
              <ul className="text-sm text-slate-500 dark:text-slate-500 space-y-1">
                <li>• Discovery lens symbolism</li>
                <li>• Dynamic flow elements</li>
                <li>• Modern geometric styling</li>
                <li>• Professional yet approachable</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">KOOCAO Concepts</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                KOOCAO logos emphasize trust, security, and modern technology with geometric shapes and professional styling suitable for fintech.
              </p>
              <ul className="text-sm text-slate-500 dark:text-slate-500 space-y-1">
                <li>• Geometric precision</li>
                <li>• Trust and security themes</li>
                <li>• Professional fintech styling</li>
                <li>• Modern abstract elements</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">COUPSA Concepts</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                COUPSA logos emphasize simplicity and accessibility, with clean designs that work well for consumer-facing coupon and deal platforms.
              </p>
              <ul className="text-sm text-slate-500 dark:text-slate-500 space-y-1">
                <li>• Simple and elegant design</li>
                <li>• Consumer-friendly appeal</li>
                <li>• Clean and minimal styling</li>
                <li>• Accessible and approachable</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3">COOPUNG Concepts</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                COOPUNG logos represent cooperation and unity, with interlocking and connected elements that symbolize partnership and collaboration.
              </p>
              <ul className="text-sm text-slate-500 dark:text-slate-500 space-y-1">
                <li>• Cooperation symbolism</li>
                <li>• Connected design elements</li>
                <li>• Partnership themes</li>
                <li>• Collaborative aesthetic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}