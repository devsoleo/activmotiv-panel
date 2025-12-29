import AuthProvider from './AuthProvider.jsx'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
    components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused fieldset': {
            borderColor: 'transparent',
          }
        }
      }
    }
  }
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <AuthProvider />
    </ThemeProvider>
  )
}

export default App
