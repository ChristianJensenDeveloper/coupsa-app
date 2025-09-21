import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { AdminDeal, Firm } from "./types";

interface DealsListProps {
  deals: AdminDeal[];
  firms: Firm[];
  onCreateDeal: () => void;
  onEditDeal: (deal: AdminDeal) => void;
  onDeleteDeal: (dealId: string) => void;
  onViewDeal: (deal: AdminDeal) => void;
}

export function DealsList({ deals, firms, onCreateDeal, onEditDeal, onDeleteDeal, onViewDeal }: DealsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getFirmName = (firmId: string) => {
    return firms.find(f => f.id === firmId)?.name || 'Unknown Firm';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'Not set';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredDeals = deals.filter(deal => 
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getFirmName(deal.firmId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Deals Management</h2>
          <p className="text-muted-foreground">Manage and monitor all deals across firms</p>
        </div>
        <Button onClick={onCreateDeal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Deal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{deals.filter(d => d.status === 'Published').length}</div>
            <div className="text-sm text-muted-foreground">Published</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{deals.filter(d => d.status === 'Draft').length}</div>
            <div className="text-sm text-muted-foreground">Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{deals.filter(d => d.status === 'Archived').length}</div>
            <div className="text-sm text-muted-foreground">Archived</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{deals.length}</div>
            <div className="text-sm text-muted-foreground">Total Deals</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Deals Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Firm</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.title}</TableCell>
                    <TableCell>{getFirmName(deal.firmId)}</TableCell>
                    <TableCell>{deal.category}</TableCell>
                    <TableCell>{deal.discountPercentage}%</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(deal.status)}>{deal.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDateTime(deal.startDate)}</TableCell>
                    <TableCell className="text-sm">{formatDateTime(deal.endDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDeal(deal)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditDeal(deal)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteDeal(deal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDeals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No deals found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}