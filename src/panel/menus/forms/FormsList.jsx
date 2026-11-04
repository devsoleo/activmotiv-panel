import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import TextField from '@mui/material/TextField'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import SearchIcon from '@mui/icons-material/Search'
import ChecklistIcon from '@mui/icons-material/Checklist'
import dayjs from 'dayjs'
import { api } from '../../../../axios'

export default function FormsList() {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('ALL')

  const fetchForms = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/forms')
      setForms(response.data.forms || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des forms:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  // Déduplication & tri par date décroissante
  const uniqueForms = useMemo(() => {
    const seen = new Set()
    const list = []

    forms.forEach((q) => {
      const { timestamp } = q.data || {}
      const timeKey = timestamp || q.completed_at || q.created_at || ''
      const dataStr = typeof q.data === 'string' ? q.data : JSON.stringify(q.data || {})
      const contentKey = `${q.user_uid || ''}_${q.label || ''}_${timeKey}_${dataStr}`

      if (!seen.has(contentKey)) {
        seen.add(contentKey)
        list.push(q)
      }
    })

    return list.sort((a, b) => {
      const timeA = a.data?.timestamp || a.completed_at || 0
      const timeB = b.data?.timestamp || b.completed_at || 0
      return dayjs(timeB).valueOf() - dayjs(timeA).valueOf()
    })
  }, [forms])

  const labels = useMemo(() => {
    const set = new Set()
    uniqueForms.forEach((q) => {
      if (q.label) set.add(q.label)
    })
    return Array.from(set).sort()
  }, [uniqueForms])

  const filteredForms = useMemo(() => {
    return uniqueForms.filter((q) => {
      const matchLabel = selectedLabel === 'ALL' || q.label === selectedLabel
      const search = searchTerm.toLowerCase().trim()
      if (!search) return matchLabel

      const matchUid = q.user_uid?.toLowerCase().includes(search)
      const matchFormLabel = q.label?.toLowerCase().includes(search)

      return matchLabel && (matchUid || matchFormLabel)
    })
  }, [uniqueForms, selectedLabel, searchTerm])

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ChecklistIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Questionnaires
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Rechercher par UID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 260 }}
          slotProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="label-filter-label">Nom du questionnaire</InputLabel>
          <Select
            labelId="label-filter-label"
            value={selectedLabel}
            label="Nom du questionnaire"
            onChange={(e) => setSelectedLabel(e.target.value)}
          >
            <MenuItem value="ALL">Tous les questionnaires</MenuItem>
            {labels.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {filteredForms.length} trouvé
          {filteredForms.length > 1 ? 's' : ''}
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredForms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Aucun questionnaire trouvé.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredForms.map((q, qIdx) => {
            const { results, timestamp } = q.data || {}
            const dateStr = dayjs(timestamp || q.completed_at).format('DD/MM/YYYY [à] HH:mm:ss')
            const uniqueKey = q.id ? `q_${q.id}` : `q_${q.user_uid}_${q.label}_${qIdx}`

            return (
              <Accordion
                key={uniqueKey}
                sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      pr: 2,
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Link
                        to={`/individual/${q.user_uid}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontFamily: 'monospace',
                          color: '#5794f2',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                        }}
                      >
                        {q.user_uid}
                      </Link>

                      <Chip
                        label={q.label || 'Sans nom'}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        Rempli le {dateStr}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Question</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>UID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Réponse</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(results) &&
                          results.map((r, idx) => (
                            <TableRow key={`${r.uid || 'r'}_${idx}`} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {r.question || `Question ${r.uid}`}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={r.uid}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ fontFamily: typeof r.answer === 'number' ? 'monospace' : 'inherit' }}
                                >
                                  {r.answer}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<FileDownloadIcon />}
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Télécharger CSV
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      )}
    </Box>
  )
}