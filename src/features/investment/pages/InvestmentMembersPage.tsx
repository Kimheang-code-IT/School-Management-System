import { useState } from 'react';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Share2, Download, Mail, Filter, Search, UserPlus, Eye, MoreVertical } from 'lucide-react';
import { useInvestmentQuery } from '@/hooks';
import { formatCurrency, formatDate } from '@/utils/formatters';

const InvestmentMembersPage = () => {
  const { data, isLoading } = useInvestmentQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  // Filter members based on search and status
  const filteredMembers = data?.members?.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.active) ||
                         (statusFilter === 'inactive' && !member.active);
    return matchesSearch && matchesStatus;
  }) || [];

  const totalContributions = filteredMembers.reduce((sum, member) => sum + member.totalContribution, 0);
  const activeMembersCount = filteredMembers.filter(member => member.active).length;

  const handleShareMembers = () => {
    const selectedMembersList = data?.members?.filter(member => 
      selectedMembers.has(member.id)
    ) || [];
    
    if (selectedMembersList.length === 0) {
      alert('Please select members to share');
      return;
    }

    // Simulate sharing functionality
    const memberNames = selectedMembersList.map(m => m.fullName).join(', ');
    alert(`Sharing information for: ${memberNames}`);
    
    // In a real app, this would open a share dialog or send emails
  };

  const handleExportMembers = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Join Date,Status,Total Contribution,Last Activity\n"
      + filteredMembers.map(member => 
          `"${member.fullName}","${member.email || 'N/A'}","${formatDate(member.joinedAt)}","${member.active ? 'Active' : 'Inactive'}","${member.totalContribution}","${member.lastActivity ? formatDate(member.lastActivity) : 'N/A'}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `investment-members-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const toggleMemberSelection = (memberId: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMembers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map(member => member.id)));
    }
  };

  const sendBulkInvite = () => {
    const recipients = selectedMembers.size > 0 
      ? filteredMembers.filter(member => selectedMembers.has(member.id))
      : filteredMembers;
    
    alert(`Sending invites to ${recipients.length} members`);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader 
        title="Investment Members" 
        description="Community investors contributing to the fund."
        action={
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        }
      />

      <Callout>
        <div className="flex items-center justify-between">
          <div>
            Member onboarding workflows will connect to KYC/AML services. 
            Export member lists for compliance reporting or share with your team.
          </div>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Compliance Dashboard
          </Button>
        </div>
      </Callout>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/70 border-slate-800/80">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{filteredMembers.length}</div>
            <div className="text-sm text-slate-400">Total Members</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/70 border-slate-800/80">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-400">{activeMembersCount}</div>
            <div className="text-sm text-slate-400">Active Members</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/70 border-slate-800/80">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalContributions)}</div>
            <div className="text-sm text-slate-400">Total Contributions</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10"
                />
              </div>
              
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-40 px-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto justify-end">
              <Button variant="outline" onClick={handleExportMembers}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={sendBulkInvite}>
                <Mail className="w-4 h-4 mr-2" />
                Send Invite
              </Button>
              <Button variant="outline" onClick={handleShareMembers}>
                <Share2 className="w-4 h-4 mr-2" />
                Share {selectedMembers.size > 0 && `(${selectedMembers.size})`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading || !data ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200 flex items-center justify-between">
              <span>Member Directory</span>
              <Badge variant="secondary">
                {filteredMembers.length} of {data.members.length} members
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-600"
                      />
                    </TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Contribution</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} className={selectedMembers.has(member.id) ? 'bg-slate-800/50' : ''}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedMembers.has(member.id)}
                          onChange={() => toggleMemberSelection(member.id)}
                          className="rounded border-slate-600"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {member.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{member.fullName}</div>
                            <div className="text-sm text-slate-400">ID: {member.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{member.email || 'No email'}</div>
                          <div className="text-slate-400">{member.phone || 'No phone'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(member.joinedAt)}</TableCell>
                      <TableCell>
                        {member.lastActivity ? (
                          <span className="text-sm">{formatDate(member.lastActivity)}</span>
                        ) : (
                          <span className="text-slate-500 text-sm">No activity</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.active ? "default" : "secondary"}>
                          {member.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(member.totalContribution)}</div>
                        {member.monthlyContribution && (
                          <div className="text-xs text-slate-400">
                            {formatCurrency(member.monthlyContribution)}/month
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No members found matching your criteria.
              </div>
            )}

            {/* Selection Actions */}
            {selectedMembers.size > 0 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">
                  {selectedMembers.size} members selected
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMembers(new Set())}
                  >
                    Clear Selection
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleShareMembers}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Selected
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sharing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-slate-200 flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share Member Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Quick Share Options</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Member Directory
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Compliance Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Create Public Member List
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Team Collaboration</h4>
              <div className="space-y-3">
                <Input placeholder="Enter team member email to share access..." />
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">View Only</Button>
                  <Button className="flex-1">Full Access</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentMembersPage;