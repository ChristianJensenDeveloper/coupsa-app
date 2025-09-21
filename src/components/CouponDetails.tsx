import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AffiliateDisclosure } from "./AffiliateDisclosure";
import { Calendar, Copy, Store, Tag, AlertCircle } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Coupon } from "./types";

interface CouponDetailsProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onClaim: (couponId: string) => void;
}

export function CouponDetails({ coupon, isOpen, onClose, onClaim }: CouponDetailsProps) {
  if (!coupon) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success("Coupon code copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image and discount */}
          <div className="relative">
            <ImageWithFallback
              src={coupon.imageUrl}
              alt={coupon.merchant}
              className="w-full h-48 object-cover rounded-lg"
            />
            <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-lg px-3 py-1">
              {coupon.discount}
            </Badge>
          </div>
          
          {/* Merchant and category info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-muted-foreground" />
              <span>{coupon.merchant}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <Badge variant="secondary">{coupon.category}</Badge>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <h4>Description</h4>
            <p className="text-muted-foreground">{coupon.description}</p>
          </div>
          
          <Separator />
          
          {/* Validity */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Valid until {coupon.validUntil}</span>
          </div>
          
          {/* Coupon Code */}
          {coupon.isClaimed && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Coupon Code</p>
                  <p className="font-mono text-lg">{coupon.code}</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Terms and conditions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <h4>Terms & Conditions</h4>
            </div>
            <p className="text-muted-foreground text-sm">{coupon.terms}</p>
          </div>
          
          {/* Affiliate Disclosure */}
          {coupon.affiliateLink && (
            <AffiliateDisclosure variant="detailed" />
          )}
          
          {/* Action button */}
          {!coupon.isClaimed && (
            <Button
              onClick={() => {
                onClaim(coupon.id);
                onClose();
              }}
              className="w-full"
              size="lg"
            >
              Claim This Coupon
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}