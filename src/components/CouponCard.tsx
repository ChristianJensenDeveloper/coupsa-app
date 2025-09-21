import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AffiliateDisclosure } from "./AffiliateDisclosure";
import { Calendar, Tag, Store } from "lucide-react";
import { Coupon } from "./types";

interface CouponCardProps {
  coupon: Coupon;
  onClaim: (couponId: string) => void;
  onViewDetails: (coupon: Coupon) => void;
}

export function CouponCard({ coupon, onClaim, onViewDetails }: CouponCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          {/* Background Image Layer */}
          {coupon.backgroundImageUrl ? (
            <div className="relative h-40">
              <div
                className="absolute inset-0 bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url(${coupon.backgroundImageUrl})`,
                  backgroundPosition: coupon.backgroundImagePosition?.replace('-', ' ') || 'center',
                  filter: `blur(${coupon.backgroundBlur || 0}px)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <ImageWithFallback
              src={coupon.imageUrl}
              alt={coupon.merchant}
              className="w-full h-40 object-cover"
            />
          )}
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground z-10">
            {coupon.discount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="line-clamp-2">{coupon.title}</h3>
            <p className="text-muted-foreground line-clamp-2">{coupon.description}</p>
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Store className="w-4 h-4" />
              <span className="text-sm">{coupon.merchant}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Until {coupon.validUntil}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 mb-3">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary">{coupon.category}</Badge>
          </div>
          
          {/* Affiliate Disclosure */}
          {coupon.affiliateLink && (
            <div className="mb-3">
              <AffiliateDisclosure variant="compact" />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={() => onViewDetails(coupon)}
              variant="outline"
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              onClick={() => onClaim(coupon.id)}
              disabled={coupon.isClaimed}
              className="flex-1"
            >
              {coupon.isClaimed ? 'Claimed' : 'Claim'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}