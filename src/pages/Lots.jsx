import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowUpDown } from 'lucide-react'

export default function Lots() {
  const [lots, setLots] = useState([
    {
      id: '1',
      address: '123 Main St',
      visited: false,
      category: 'Available',
      price: 100000,
      acreage: 1.5,
      contact_name: 'John Doe',
      contact_phone: '555-1234'
    },
    {
      id: '2',
      address: '456 Oak Ave',
      visited: true,
      category: 'Inquired',
      price: 150000,
      acreage: 2.0,
      contact_name: 'Jane Smith',
      contact_phone: '555-5678'
    }
  ])
  const [lotDialogOpen, setLotDialogOpen] = useState(false)
  const [editingLot, setEditingLot] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lotToDelete, setLotToDelete] = useState(null)
  const [sortField, setSortField] = useState('created_date')
  const [sortDirection, setSortDirection] = useState('desc')

  // Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Sort lots
  const sortedLots = [...lots].sort((a, b) => {
    let valA = a[sortField]
    let valB = b[sortField]
    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()
    if (valA < valB) return sortDirection === 'desc' ? 1 : -1
    if (valA > valB) return sortDirection === 'desc' ? -1 : 1
    return 0
  })

  // CRUD logic
  const handleEdit = (lot) => {
    setEditingLot(lot)
    setLotDialogOpen(true)
  }
  const handleDelete = (lot) => {
    setLotToDelete(lot)
    setDeleteDialogOpen(true)
  }
  const confirmDelete = () => {
    if (lotToDelete) {
      setLots(lots.filter((l) => l.id !== lotToDelete.id))
      setDeleteDialogOpen(false)
      setLotToDelete(null)
    }
  }
  const handleSaveLot = (lotData) => {
    if (editingLot) {
      setLots(
        lots.map((l) =>
          l.id === editingLot.id ? { ...editingLot, ...lotData } : l
        )
      )
    } else {
      setLots([...lots, { ...lotData, id: String(Date.now()) }])
    }
    setLotDialogOpen(false)
  }

  // LotDialog now uses local onSave
  function LotDialog({ open, onOpenChange, lot, onSave }) {
    const [formData, setFormData] = useState({
      address: '',
      visited: false,
      category: 'Available',
      price: '',
      acreage: '',
      contact_name: '',
      contact_phone: ''
    })

    useEffect(() => {
      if (lot) {
        setFormData({
          address: lot.address || '',
          visited: lot.visited || false,
          category: lot.category || 'Available',
          price: lot.price || '',
          acreage: lot.acreage || '',
          contact_name: lot.contact_name || '',
          contact_phone: lot.contact_phone || ''
        })
      } else {
        setFormData({
          address: '',
          visited: false,
          category: 'Available',
          price: '',
          acreage: '',
          contact_name: '',
          contact_phone: ''
        })
      }
    }, [lot, open])

    const handleSubmit = (e) => {
      e.preventDefault()
      const data = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        acreage: formData.acreage ? parseFloat(formData.acreage) : null
      }
      onSave(data)
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{lot ? 'Edit Lot' : 'Add New Lot'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* ...existing form fields... */}
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit'>{lot ? 'Update Lot' : 'Create Lot'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // Main JSX return
  return (
    <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
      <div className='card bg-base-100 shadow mb-8'>
        <div className='card-body'>
          <h2 className='card-title'>Lots</h2>
          <button
            className='btn btn-primary mb-4 flex gap-2'
            onClick={() => setLotDialogOpen(true)}>
            <Plus className='h-4 w-4' /> Add Lot
          </button>
          <div className='overflow-x-auto'>
            <table className='table table-zebra w-full'>
              <thead>
                <tr>
                  <th>
                    <button
                      onClick={() => handleSort('address')}
                      className='flex items-center gap-1'>
                      Address <ArrowUpDown className='h-4 w-4' />
                    </button>
                  </th>
                  <th>Visited</th>
                  <th>
                    <button
                      onClick={() => handleSort('category')}
                      className='flex items-center gap-1'>
                      Category <ArrowUpDown className='h-4 w-4' />
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('price')}
                      className='flex items-center gap-1'>
                      Price <ArrowUpDown className='h-4 w-4' />
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('acreage')}
                      className='flex items-center gap-1'>
                      Acreage <ArrowUpDown className='h-4 w-4' />
                    </button>
                  </th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedLots.map((lot) => (
                  <tr key={lot.id}>
                    <td>{lot.address}</td>
                    <td>
                      <input type='checkbox' checked={lot.visited} readOnly />
                    </td>
                    <td>{lot.category}</td>
                    <td>
                      {lot.price ? `$${lot.price.toLocaleString()}` : '—'}
                    </td>
                    <td>{lot.acreage ? `${lot.acreage} ac` : '—'}</td>
                    <td>
                      <div className='text-sm'>
                        <div className='font-medium'>
                          {lot.contact_name || '—'}
                        </div>
                        <div className='text-slate-600'>
                          {lot.contact_phone || '—'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className='flex items-center gap-2'>
                        <button
                          className='btn btn-sm btn-outline mr-2'
                          onClick={() => handleEdit(lot)}>
                          <Pencil className='h-4 w-4' />
                        </button>
                        <button
                          className='btn btn-sm btn-error'
                          onClick={() => handleDelete(lot)}>
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LotDialog
        open={lotDialogOpen}
        onOpenChange={(open) => {
          setLotDialogOpen(open)
          if (!open) setEditingLot(null)
        }}
        lot={editingLot}
        onSave={handleSaveLot}
      />

      {/* Delete confirmation dialog */}
      {deleteDialogOpen && (
        <div className='modal modal-open'>
          <div className='modal-box'>
            <h3 className='font-bold text-lg'>Delete Lot?</h3>
            <p className='py-4'>
              This will permanently delete the lot at "{lotToDelete?.address}
              ". This action cannot be undone.
            </p>
            <div className='modal-action flex gap-2'>
              <button
                type='button'
                className='btn'
                onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </button>
              <button
                type='button'
                className='btn btn-error'
                onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
