import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowUpDown } from 'lucide-react'
import Topbar from '../components/Topbar'

const API_URL = 'http://localhost:4000/api'

export default function Lots() {
  const [lots, setLots] = useState([])
  const [lotDialogOpen, setLotDialogOpen] = useState(false)
  const [editingLot, setEditingLot] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lotToDelete, setLotToDelete] = useState(null)
  const [sortField, setSortField] = useState('created_date')
  const [sortDirection, setSortDirection] = useState('desc')

  // Fetch lots from backend
  useEffect(() => {
    fetch(`${API_URL}/lots`)
      .then((res) => res.json())
      .then(setLots)
      .catch(() => setLots([]))
  }, [])

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
  const confirmDelete = async () => {
    if (lotToDelete) {
      await fetch(`${API_URL}/lots/${lotToDelete.id}`, { method: 'DELETE' })
      setLots(lots.filter((l) => l.id !== lotToDelete.id))
      setDeleteDialogOpen(false)
      setLotToDelete(null)
    }
  }
  const handleSaveLot = async (lotData) => {
    if (editingLot) {
      const res = await fetch(`${API_URL}/lots/${editingLot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lotData)
      })
      const updated = await res.json()
      setLots(lots.map((l) => (l.id === editingLot.id ? updated : l)))
    } else {
      const res = await fetch(`${API_URL}/lots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lotData)
      })
      const created = await res.json()
      setLots([...lots, created])
    }
    setLotDialogOpen(false)
    setEditingLot(null)
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
      <dialog className={`modal ${open ? 'modal-open' : ''}`}>
        <form
          method='dialog'
          className='modal-box max-w-2xl bg-base-100'
          onSubmit={handleSubmit}>
          <h3 className='font-bold text-lg mb-4 text-primary'>
            {lot ? 'Edit Lot' : 'Add New Lot'}
          </h3>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='address'
                className='block mb-1 font-medium text-secondary'>
                Address
              </label>
              <input
                id='address'
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder='Enter address'
                required
                className='input input-bordered input-primary w-full'
              />
            </div>
            <div>
              <label
                htmlFor='visited'
                className='block mb-1 font-medium text-secondary'>
                Visited
              </label>
              <input
                id='visited'
                type='checkbox'
                checked={formData.visited}
                onChange={(e) =>
                  setFormData({ ...formData, visited: e.target.checked })
                }
                className='checkbox checkbox-primary'
              />
            </div>
            <div>
              <label
                htmlFor='category'
                className='block mb-1 font-medium text-secondary'>
                Category
              </label>
              <input
                id='category'
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder='Enter category'
                required
                className='input input-bordered input-secondary w-full'
              />
            </div>
            <div>
              <label
                htmlFor='price'
                className='block mb-1 font-medium text-secondary'>
                Price
              </label>
              <input
                id='price'
                type='number'
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder='Enter price'
                className='input input-bordered input-primary w-full'
              />
            </div>
            <div>
              <label
                htmlFor='acreage'
                className='block mb-1 font-medium text-secondary'>
                Acreage
              </label>
              <input
                id='acreage'
                type='number'
                value={formData.acreage}
                onChange={(e) =>
                  setFormData({ ...formData, acreage: e.target.value })
                }
                placeholder='Enter acreage'
                className='input input-bordered input-primary w-full'
              />
            </div>
            <div>
              <label
                htmlFor='contact_name'
                className='block mb-1 font-medium text-secondary'>
                Contact Name
              </label>
              <input
                id='contact_name'
                value={formData.contact_name}
                onChange={(e) =>
                  setFormData({ ...formData, contact_name: e.target.value })
                }
                placeholder='Enter contact name'
                className='input input-bordered input-secondary w-full'
              />
            </div>
            <div>
              <label
                htmlFor='contact_phone'
                className='block mb-1 font-medium text-secondary'>
                Contact Phone
              </label>
              <input
                id='contact_phone'
                value={formData.contact_phone}
                onChange={(e) =>
                  setFormData({ ...formData, contact_phone: e.target.value })
                }
                placeholder='Enter contact phone'
                className='input input-bordered input-secondary w-full'
              />
            </div>
          </div>
          <div className='modal-action flex gap-2 mt-6'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button type='submit' className='btn btn-primary'>
              {lot ? 'Update Lot' : 'Create Lot'}
            </button>
          </div>
        </form>
      </dialog>
    )
  }

  // Main JSX return
  return (
    <>
      <Topbar />
      <div className='h-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
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
    </>
  )
}
