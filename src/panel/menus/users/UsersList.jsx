import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import {
  Chip,
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  TextField,
  Snackbar,
  Stack
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { api } from '../../../../axios'
import dayjs from 'dayjs'
import { UserEndDate } from '../../../components/UserEndDate'

const paginationModel = { page: 0, pageSize: 15 }

export default function UsersList({ refreshTrigger }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  // Selection state (Array of selected row IDs)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [gridKey, setGridKey] = useState(0)

  // Double Verification Dialog states
  const [openFirstDialog, setOpenFirstDialog] = useState(false)
  const [openSecondDialog, setOpenSecondDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const selectedUsers = useMemo(() => {
    const selectedIdsSet = new Set(selectedRowIds)
    return rows.filter((r) => selectedIdsSet.has(r.id))
  }, [rows, selectedRowIds])

  const selectedCount = selectedUsers.length

  const hasAdminSelected = useMemo(() => {
    return selectedUsers.some((u) => u.team == 0)
  }, [selectedUsers])

  const handleToggleAdmin = async (userRow) => {
    const isCurrentlyAdmin = userRow.team == 0
    const newTeam = isCurrentlyAdmin ? 1 : 0
    const newIsAdmin = !isCurrentlyAdmin

    try {
      await api.put(`/admin/users/${userRow.id}/team`, { team: newTeam })
      setRows((prevRows) =>
        prevRows.map((r) => (r.id === userRow.id ? { ...r, team: newTeam } : r))
      )
      setSnackbar({
        open: true,
        message: `Statut administrateur de ${userRow.uid} modifié vers : ${newIsAdmin ? 'Oui' : 'Non'}.`,
        severity: 'success'
      })
    } catch (err) {
      console.error('Erreur lors de la modification du statut admin:', err)
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour du statut administrateur.',
        severity: 'error'
      })
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 70, minWidth: 60 },
    {
      field: 'uid',
      headerName: 'UID',
      width: 140,
      minWidth: 120,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Link
          to={`/individual/${params.value}`}
          style={{ fontFamily: 'monospace', color: '#5794f2', textDecoration: 'none', fontWeight: 600 }}
        >
          {params.value}
        </Link>
      )
    },
    {
      field: 'admin',
      headerName: 'Admin',
      width: 90,
      minWidth: 80,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Oui', 'Non'],
      valueGetter: (value, row) => (row.team == 0 ? 'Oui' : 'Non'),
      renderCell: (params) => {
        const isAdmin = params.row.team == 0

        return (
          <Chip
            label={isAdmin ? 'Oui' : 'Non'}
            color={isAdmin ? 'primary' : 'default'}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleToggleAdmin(params.row)
            }}
            sx={{ cursor: 'pointer', fontWeight: 600 }}
            title="Cliquer pour basculer le statut administrateur"
          />
        )
      }
    },
    {
      field: 'group',
      headerName: 'Groupe',
      width: 80,
      minWidth: 70,
      renderCell: (params) => {
        return (
          <span style={{ fontFamily: 'monospace' }}>
            {params.row.team > 0 ? params.row.team : '-'}
          </span>
        )
      }
    },
    {
      field: 'last_login',
      headerName: 'Dernière connexion',
      width: 170,
      minWidth: 150,
      flex: 1.2,
      renderCell: (params) => (params.value ? dayjs(params.value).format('HH:mm:ss DD/MM/YYYY') : 'Jamais')
    },
    {
      field: 'creation_date',
      headerName: "Date d'inscription",
      width: 170,
      minWidth: 150,
      flex: 1.2,
      renderCell: (params) => (params.value ? dayjs(params.value).format('HH:mm:ss DD/MM/YYYY') : 'N/A')
    },
    {
      field: 'end_date',
      headerName: 'Date de fin',
      width: 170,
      minWidth: 150,
      flex: 1.2,
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            {params.row.team > 0 ? <UserEndDate uid={params.row.uid} /> : '-'}
          </>
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      minWidth: 100,
      renderCell: (params) => {
        const isDisable = params.row.team == -1

        return (
          <Chip
            label={isDisable ? 'Désactivé' : 'Actif'}
            color={isDisable ? 'error' : 'primary'}
            size="small"
          />
        )
      }
    }
  ]

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/users/list')
      setRows(response.data.users || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, refreshTrigger])

  const handleSelectionModelChange = (newSelection) => {
    let ids = []
    if (Array.isArray(newSelection)) {
      ids = newSelection
    } else if (newSelection?.ids instanceof Set) {
      ids = Array.from(newSelection.ids)
    } else if (Array.isArray(newSelection?.ids)) {
      ids = newSelection.ids
    } else if (newSelection instanceof Set) {
      ids = Array.from(newSelection)
    }
    setSelectedRowIds(ids)
  }

  const handleCloseDialogs = () => {
    setOpenFirstDialog(false)
    setOpenSecondDialog(false)
    setConfirmText('')
  }

  const handleProceedToSecondVerification = () => {
    setOpenFirstDialog(false)
    setConfirmText('')
    setOpenSecondDialog(true)
  }

  const handleDeleteSelected = async () => {
    if (selectedCount === 0) return
    setDeleting(true)
    try {
      const idsToDelete = selectedUsers.map((u) => u.id)
      await api.post('/admin/users/delete-batch', { ids: idsToDelete })
      setSnackbar({
        open: true,
        message: `${selectedCount} compte(s) supprimé(s) avec succès.`,
        severity: 'success'
      })
      setSelectedRowIds([])
      setGridKey((prev) => prev + 1)
      handleCloseDialogs()
      await fetchUsers()
    } catch (err) {
      console.error('Erreur lors de la suppression des utilisateurs:', err)
      setSnackbar({
        open: true,
        message: 'Erreur lors de la suppression des comptes.',
        severity: 'error'
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
          mb: 2
        }}
      >
        <Typography variant="h5" component="h5" sx={{ fontWeight: 600 }}>
          Liste des participants
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'stretch', sm: 'flex-end' }
          }}
        >
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={selectedCount === 0 || hasAdminSelected}
            onClick={() => setOpenFirstDialog(true)}
            sx={{ fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
          >
            Supprimer {selectedCount > 0 ? `(${selectedCount})` : ''}
          </Button>
          {hasAdminSelected && (
            <Typography variant="caption" color="error.main" sx={{ fontWeight: 600, mt: 0.5, textAlign: { xs: 'left', sm: 'right' } }}>
              Suppression bloquée : au moins un compte admin est sélectionné
            </Typography>
          )}
        </Box>
      </Box>

      <Paper sx={{ mt: 2, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <DataGrid
            key={gridKey}
            rows={rows}
            columns={columns}
            loading={loading}
            autoHeight={false}
            processRowUpdate={async (newRow, oldRow) => {
              const oldIsAdmin = oldRow.team == 0 ? 'Oui' : 'Non'
              if (newRow.admin && newRow.admin !== oldIsAdmin) {
                const newTeam = newRow.admin === 'Oui' ? 0 : (oldRow.team === 0 ? 1 : oldRow.team)
                await api.put(`/admin/users/${newRow.id}/team`, { team: newTeam })
                setSnackbar({
                  open: true,
                  message: `Statut admin de ${newRow.uid} mis à jour.`,
                  severity: 'success'
                })
                return { ...newRow, team: newTeam }
              }
              if (newRow.sensor_number !== oldRow.sensor_number) {
                await api.put(`/admin/users/${newRow.id}/sensors`, { sensor_number: newRow.sensor_number })
              }
              return newRow
            }}
            initialState={{
              pagination: { paginationModel },
              sorting: {
                sortModel: [{ field: 'id', sort: 'desc' }]
              }
            }}
            pageSizeOptions={[5, 10, 20, 30]}
            checkboxSelection
            onRowSelectionModelChange={handleSelectionModelChange}
            sx={{
              border: 0,
              minHeight: 400,
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none'
              },
              '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none'
              }
            }}
          />
        </Box>
      </Paper>

      {/* Étape 1 : Dialogue de confirmation initiale */}
      <Dialog open={openFirstDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Demande de suppression ({selectedCount} participant{selectedCount > 1 ? 's' : ''})
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Vous avez coché <strong>{selectedCount}</strong> compte(s) à supprimer :
          </DialogContentText>

          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            sx={{
              mb: 2,
              maxHeight: 150,
              overflowY: 'auto',
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            {selectedUsers.map((u) => (
              <Chip
                key={u.id}
                label={`${u.uid} (ID ${u.id})`}
                color="error"
                variant="outlined"
                size="small"
                style={{ fontFamily: 'monospace' }}
              />
            ))}
          </Stack>

          <Alert severity="warning">
            Voulez-vous poursuivre vers la seconde étape de vérification pour confirmer cette suppression ?
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
          <Button onClick={handleCloseDialogs} color="inherit" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Annuler
          </Button>
          <Button onClick={handleProceedToSecondVerification} color="error" variant="contained" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Continuer vers la vérification finale
          </Button>
        </DialogActions>
      </Dialog>

      {/* Étape 2 : Dialogue de DOUBLE VÉRIFICATION finale */}
      <Dialog open={openSecondDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main', fontWeight: 700 }}>
          <WarningAmberIcon color="error" />
          DOUBLE VÉRIFICATION - Suppression définitive
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="error" sx={{ mb: 2, fontWeight: 500 }}>
            <strong>ATTENTION : Cette action est IRRÉVERSIBLE !</strong>
            <br />
            La suppression supprimera définitivement les <strong>{selectedCount}</strong> compte(s) sélectionné(s) ainsi que toutes leurs données enregistrées (questionnaires, capteurs, expositions, sessions).
          </Alert>

          <DialogContentText sx={{ mb: 2 }}>
            Pour valider définitivement la suppression, veuillez saisir le mot <strong>SUPPRIMER</strong> ci-dessous :
          </DialogContentText>

          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Tapez SUPPRIMER"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            slotProps={{
              input: {
                style: { fontFamily: 'monospace', fontWeight: 'bold' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
          <Button onClick={handleCloseDialogs} color="inherit" disabled={deleting} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteSelected}
            color="error"
            variant="contained"
            disabled={confirmText.trim() !== 'SUPPRIMER' || deleting}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {deleting ? 'Suppression en cours...' : `Confirmer la suppression définitive (${selectedCount})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}