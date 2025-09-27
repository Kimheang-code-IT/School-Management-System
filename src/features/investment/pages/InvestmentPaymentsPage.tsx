import { useState } from 'react';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, Download, Search } from 'lucide-react';
import { useInvestmentQuery } from '@/hooks';
import { formatCurrency, formatDate } from '@/utils/formatters';

// Simple dialog component (fallback if your Dialog component has issues)
const SimpleDialog = ({ open, onClose, title, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md mx-4 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const InvestmentPaymentsPage = () => {
  const { data, isLoading } = useInvestmentQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  // Simple form state
  const [formData, setFormData] = useState({
    memberId: '',
    type: 'income',
    amount: '',
    description: '',
    recordedAt: new Date().toISOString().split('T')[0]
  });

  // Filter payments safely
  const filteredPayments = (data?.payments || []).filter(payment => {
    if (!payment) return false;
    
    const member = data.members?.find(m => m.id === payment.memberId);
    const matchesSearch = member?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Calculate totals safely
  const totals = filteredPayments.reduce((acc, payment) => {
    if (!payment) return acc;
    
    if (payment.type === 'income') {
      acc.income += payment.amount || 0;
    } else {
      acc.expense += payment.amount || 0;
    }
    return acc;
  }, { income: 0, expense: 0 });

  // Reset form
  const resetForm = () => {
    setFormData({
      memberId: '',
      type: 'income',
      amount: '',
      description: '',
      recordedAt: new Date().toISOString().split('T')[0]
    });
    setEditingPayment(null);
  };

  // Create new payment
  const handleCreatePayment = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Edit payment
  const handleEditPayment = (payment) => {
    if (!payment) return;
    
    setEditingPayment(payment);
    setFormData({
      memberId: payment.memberId || '',
      type: payment.type || 'income',
      amount: payment.amount?.toString() || '',
      description: payment.description || '',
      recordedAt: payment.recordedAt?.split('T')[0] || new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  // Delete payment
  const handleDeletePayment = (payment) => {
    setPaymentToDelete(payment);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    console.log('Deleting payment:', paymentToDelete);
    setIsDeleteDialogOpen(false);
    setPaymentToDelete(null);
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submissionData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      recordedAt: new Date(formData.recordedAt).toISOString()
    };

    if (editingPayment) {
      console.log('Updating payment:', submissionData);
    } else {
      console.log('Creating payment:', submissionData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  // Export to CSV
  const handleExportPayments = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Member,Type,Amount,Date,Description\n"
      + filteredPayments.map(payment => {
          const member = data?.members?.find(m => m.id === payment.memberId);
          return `"${member?.fullName || 'Unknown'}","${payment.type}","${payment.amount}","${formatDate(payment.recordedAt)}","${payment.description || ''}"`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payments-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ModuleHeader title="Investment Payments" description="Cash movements within the investment pool." />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader 
        title="Investment Payments" 
        description="Cash movements within the investment pool."
        action={
          <Button onClick={handleCreatePayment}>
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
        }
      />

      <Callout>
        Integration with your preferred ledger will reconcile these transactions automatically once APIs are connected.
        Use the buttons below to manage payments.
      </Callout>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/70 border-slate-800/80">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totals.income)}</div>
            <div className="text-sm text-slate-400">Total Income</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/70 border-slate-800/80">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rose-400">{formatCurrency(totals.expense)}</div>
            <div className="text-sm text-slate-400">Total Expenses</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/70 border-slate-800/80">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{formatCurrency(totals.income - totals.expense)}</div>
            <div className="text-sm text-slate-400">Net Flow</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-white w-full sm:w-32"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            <Button variant="outline" onClick={handleExportPayments}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200 flex items-center justify-between">
            <span>Payment History</span>
            <Badge variant="secondary">
              {filteredPayments.length} transactions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => {
                    const member = data.members?.find((item) => item.id === payment.memberId);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {member?.fullName || 'Unknown Member'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.type === 'income' ? "default" : "destructive"}>
                            {payment.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {payment.description || 'No description'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatDate(payment.recordedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditPayment(payment)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeletePayment(payment)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Payment Dialog */}
      <SimpleDialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        title={editingPayment ? 'Edit Payment' : 'Add New Payment'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Member</label>
            <select 
              value={formData.memberId}
              onChange={(e) => setFormData({...formData, memberId: e.target.value})}
              className="w-full px-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-white"
              required
            >
              <option value="">Select a member</option>
              {data?.members?.map(member => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-white"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Amount</label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Payment description..."
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Date</label>
            <Input
              type="date"
              value={formData.recordedAt}
              onChange={(e) => setFormData({...formData, recordedAt: e.target.value})}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingPayment ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </SimpleDialog>

      {/* Delete Confirmation Dialog */}
      <SimpleDialog 
        open={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this payment?</p>
          
          {paymentToDelete && (
            <div className="p-3 bg-slate-800 rounded border border-slate-700">
              <div className="font-medium">
                {formatCurrency(paymentToDelete.amount)} • {paymentToDelete.type.toUpperCase()}
              </div>
              <div className="text-sm text-slate-400">
                Member: {data.members?.find(m => m.id === paymentToDelete.memberId)?.fullName || 'Unknown'}
              </div>
              <div className="text-sm text-slate-400">
                Date: {formatDate(paymentToDelete.recordedAt)}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </SimpleDialog>
    </div>
  );
};

export default InvestmentPaymentsPage;