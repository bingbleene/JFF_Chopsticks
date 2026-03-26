import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import ImportForm from '@/features/import/ImportForm';
import LoadingItem from '@/components/LoadingItem';
import ImportDetail from '@/features/import/ImportDetail';
import ImportTable from '@/features/import/ImportTable';
import ListPagination from '../../components/ListPagination';
import { Plus, Search } from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { Input } from '@/components/ui/input';

import api from '@/lib/axios';
import { toast } from 'sonner';

const ImportManagement = () => {
  const handleNext = () => { if (page < totalPages) setPage(prev => prev + 1); };
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [imports, setImports] = useState([]);
  const [filteredImports, setFilteredImports] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedImport, setSelectedImport] = useState(null);
  const pageSize = 10;

  const fetchImports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/imports');
      setImports(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Không thể lấy danh sách phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
  }, []);

  useEffect(() => {
    const filtered = imports.filter(imp =>
      imp.importIndex?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.staff?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredImports(filtered);
    setPage(1);
  }, [searchTerm, imports]);

  const totalPages = Math.ceil(filteredImports.length / pageSize) || 1;
  const visibleImports = filteredImports.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => { if (page > 1) setPage(prev => prev - 1); };
  const handlePageChange = (newPage) => { setPage(newPage); };

  const handleAddImport = (newImport) => {
    setImports(prev => [newImport, ...prev]);
    setIsFormOpen(false);
  };

  const handleDisableImport = async (imp) => {
    const reason = window.prompt('Nhập lý do huỷ phiếu nhập này:');
    if (!reason || reason.trim() === '') {
      toast.error('Bạn phải nhập lý do huỷ!');
      return;
    }
    try {
      await api.put(`/imports/${imp._id}/cancel`, { cancelReason: reason });
      toast.success('Đã hủy phiếu nhập');
      fetchImports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy phiếu nhập');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Danh sách phiếu nhập</CardTitle>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} /> Thêm phiếu nhập
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Thêm phiếu nhập mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin phiếu nhập mới.
                  </DialogDescription>
                </DialogHeader>
                <ImportForm onSubmit={handleAddImport} onClose={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <SearchBox
              placeholder="Tìm kiếm mã phiếu hoặc nhân viên..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <LoadingItem className="mx-auto my-8" />
            ) : visibleImports.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Không có phiếu nhập nào.</div>
            ) : (
              <ImportTable
                visibleImports={visibleImports}
                page={page}
                pageSize={pageSize}
                setSelectedImport={setSelectedImport}
                handleDisableImport={handleDisableImport}
              />
            )}
          </div>
          {!loading && visibleImports.length > 0 && (
            <div className="pt-2">
              <ListPagination
                page={page}
                totalPages={totalPages}
                onNext={handleNext}
                onPrev={handlePrev}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!selectedImport} onOpenChange={() => setSelectedImport(null)}>
        <DialogContent>
          <ImportDetail selectedImport={selectedImport} onClose={() => setSelectedImport(null)} />
        </DialogContent>
      </Dialog>

      
    </div>
  );
}

export default ImportManagement;
