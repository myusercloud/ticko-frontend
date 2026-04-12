import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#fff7e6',
      100: '#fde7bf',
      200: '#fbd68f',
      300: '#f7c35e',
      400: '#efad35',
      500: '#d48c28',
      600: '#b6731f',
      700: '#8f5918',
      800: '#684111',
      900: '#43280a',
    },
  },
  fonts: {
    heading: "'DM Serif Display', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
  },
  styles: {
    global: {
      'html, body': {
        bg: '#0a0908',
        color: '#f5efe6',
      },
      body: {
        margin: 0,
      },
      a: {
        textDecoration: 'none',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          color: 'gray.800',
        },
      },
    },
  },
});

export default theme;
