import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { Coupon } from './types';

interface VirtualizedDealsListProps {
  deals: Coupon[];
  onDealClick?: (deal: Coupon) => void;
  onSaveDeal?: (deal: Coupon) => void;
  className?: string;
  itemHeight?: number;
  maxHeight?: number;
}

interface DealItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    deals: Coupon[];
    onDealClick?: (deal: Coupon) => void;
    onSaveDeal?: (deal: Coupon) => void;
  };
}

const DealItem = React.memo(({ index, style, data }: DealItemProps) => {
  const { deals, onDealClick, onSaveDeal } = data;
  const deal = deals[index];

  if (!deal) return null;

  const isExpiringSoon = new Date(deal.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isExpired = new Date(deal.endDate) < new Date();

  return (
    <div style={style} className="px-2">
      <div className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-xl border border-white/30 dark:border-slate-700/40 p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${isExpired ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          {/* Deal Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {deal.merchant.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {deal.merchant}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 text-xs">
                    {deal.discount}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {deal.category}
                  </Badge>
                  {deal.hasVerificationBadge && (
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0 text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                  {isExpiringSoon && !isExpired && (
                    <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-0 text-xs">
                      ⏰ Expires Soon
                    </Badge>
                  )}
                  {isExpired && (
                    <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0 text-xs">
                      ❌ Expired
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
              {deal.title}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Until {deal.validUntil}</span>
              </div>
              {deal.code && (
                <div className="flex items-center gap-1">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                    {deal.code}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {onSaveDeal && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveDeal(deal);
                }}
                className="p-2"
                disabled={isExpired}
              >
                <Heart className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (deal.affiliateLink) {
                  window.open(deal.affiliateLink, '_blank', 'noopener,noreferrer');
                } else if (onDealClick) {
                  onDealClick(deal);
                }
              }}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isExpired}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

DealItem.displayName = 'DealItem';

export function VirtualizedDealsList({
  deals,
  onDealClick,
  onSaveDeal,
  className = '',
  itemHeight = 140,
  maxHeight = 600
}: VirtualizedDealsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || deal.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [deals, searchTerm, filterCategory]);

  const itemData = useMemo(() => ({
    deals: filteredDeals,
    onDealClick,
    onSaveDeal
  }), [filteredDeals, onDealClick, onSaveDeal]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(deals.map(deal => deal.category)));
    return ['All', ...cats];
  }, [deals]);

  if (filteredDeals.length === 0) {
    return (
      <div className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-xl border border-white/30 dark:border-slate-700/40 p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No deals found
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-xl border border-white/30 dark:border-slate-700/40 ${className}`}>
      {/* Search and Filter Header */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredDeals.length} of {deals.length} deals
        </div>
      </div>

      {/* Virtualized List */}
      <div className="p-2">
        <List
          height={Math.min(maxHeight, filteredDeals.length * itemHeight)}
          itemCount={filteredDeals.length}
          itemSize={itemHeight}
          itemData={itemData}
          width="100%"
          className="scrollbar-hide"
        >
          {DealItem}
        </List>
      </div>
    </div>
  );
}