'use client';

import {
  Box,
  Flex,
  Button,
  Link as ChakraLink,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Stack,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { href: '/', label: 'Events' },
  { href: '/tickets', label: 'My Tickets' },
  { href: '/scan', label: 'Scan' },
  { href: '/dashboard', label: 'Dashboard' },
];

const fadeDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export function Navbar() {
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={100}
      bg="rgba(10,9,8,0.88)"
      backdropFilter="blur(12px)"
      borderBottom="1px solid rgba(245,239,230,0.1)"
      animation={`${fadeDown} 0.4s ease both`}
    >
      {/* amber top accent line */}
      <Box h="1px" bg="rgba(212,140,40,0.5)" />

      <Flex
        maxW="7xl"
        mx="auto"
        px={{ base: 5, md: 10 }}
        py="14px"
        align="center"
        justify="space-between"
        gap={4}
      >
        {/* ── Wordmark ── */}
        <ChakraLink
          as={Link}
          href="/"
          fontFamily="'DM Serif Display', Georgia, serif"
          fontStyle="italic"
          fontSize="22px"
          fontWeight="400"
          color="#f5efe6"
          letterSpacing="-0.02em"
          lineHeight="1"
          _hover={{ color: '#d48c28', textDecoration: 'none' }}
          transition="color 0.15s"
        >
          Ticko
        </ChakraLink>

        {/* ── Desktop nav links ── */}
        <Stack
          direction="row"
          spacing={7}
          display={{ base: 'none', md: 'flex' }}
          align="center"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <ChakraLink
                key={link.href}
                as={Link}
                href={link.href}
                fontFamily="'DM Sans', sans-serif"
                fontSize="13px"
                fontWeight="500"
                letterSpacing="0.06em"
                textTransform="uppercase"
                color={isActive ? '#d48c28' : 'rgba(245,239,230,0.55)'}
                position="relative"
                _hover={{ color: '#f5efe6', textDecoration: 'none' }}
                transition="color 0.15s"
                _after={
                  isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        bottom: '-18px',
                        left: '0',
                        right: '0',
                        height: '1px',
                        bg: '#d48c28',
                      }
                    : {}
                }
              >
                {link.label}
              </ChakraLink>
            );
          })}
        </Stack>

        {/* ── Auth area ── */}
        <Flex align="center" gap={3}>
          {isLoading ? (
            <Spinner size="sm" color="rgba(245,239,230,0.4)" />
          ) : isAuthenticated ? (
            <>
              <Text
                display={{ base: 'none', sm: 'block' }}
                fontFamily="'DM Sans', sans-serif"
                fontSize="12px"
                letterSpacing="0.04em"
                color="rgba(245,239,230,0.4)"
                maxW="160px"
                isTruncated
              >
                {user?.email}
              </Text>
              <Button
                size="sm"
                variant="unstyled"
                fontFamily="'DM Sans', sans-serif"
                fontSize="12px"
                fontWeight="500"
                letterSpacing="0.1em"
                textTransform="uppercase"
                color="rgba(245,239,230,0.5)"
                border="1px solid rgba(245,239,230,0.18)"
                borderRadius="2px"
                px={4}
                h="30px"
                display="flex"
                alignItems="center"
                _hover={{
                  color: '#f5efe6',
                  borderColor: 'rgba(245,239,230,0.4)',
                  bg: 'rgba(245,239,230,0.06)',
                }}
                transition="all 0.15s"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                as={Link}
                href="/auth/login"
                size="sm"
                variant="unstyled"
                fontFamily="'DM Sans', sans-serif"
                fontSize="12px"
                fontWeight="500"
                letterSpacing="0.1em"
                textTransform="uppercase"
                color="rgba(245,239,230,0.45)"
                display={{ base: 'none', sm: 'inline-flex' }}
                alignItems="center"
                px={3}
                h="30px"
                _hover={{ color: '#f5efe6', textDecoration: 'none' }}
                transition="color 0.15s"
              >
                Log in
              </Button>
              <Button
                as={Link}
                href="/auth/register"
                size="sm"
                variant="unstyled"
                fontFamily="'DM Sans', sans-serif"
                fontSize="12px"
                fontWeight="500"
                letterSpacing="0.1em"
                textTransform="uppercase"
                color="#0a0908"
                bg="#d48c28"
                borderRadius="2px"
                px={4}
                h="30px"
                display="inline-flex"
                alignItems="center"
                _hover={{ bg: '#f5c842', textDecoration: 'none' }}
                transition="background 0.15s"
              >
                Sign up
              </Button>
            </>
          )}

          {/* ── Mobile burger ── */}
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            display={{ base: 'flex', md: 'none' }}
            variant="unstyled"
            color="rgba(245,239,230,0.6)"
            _hover={{ color: '#f5efe6' }}
            transition="color 0.15s"
            minW="auto"
            h="auto"
            onClick={onOpen}
          />
        </Flex>
      </Flex>

      {/* ── Mobile Drawer ── */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerOverlay bg="rgba(10,9,8,0.7)" backdropFilter="blur(4px)" />
        <DrawerContent
          bg="#0f0e0c"
          borderLeft="1px solid rgba(245,239,230,0.1)"
          fontFamily="'DM Sans', sans-serif"
        >
          <DrawerCloseButton
            color="rgba(245,239,230,0.5)"
            _hover={{ color: '#f5efe6' }}
            top={4}
            right={5}
          />

          {/* drawer wordmark */}
          <Box px={6} pt={6} pb={4} borderBottom="1px solid rgba(245,239,230,0.1)">
            <Text
              fontFamily="'DM Serif Display', Georgia, serif"
              fontStyle="italic"
              fontSize="20px"
              color="#f5efe6"
              letterSpacing="-0.02em"
            >
              Ticko
            </Text>
          </Box>

          <Box px={6} pt={6}>
            <Stack spacing={0}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <ChakraLink
                    key={link.href}
                    as={Link}
                    href={link.href}
                    onClick={onClose}
                    display="flex"
                    alignItems="center"
                    py={3}
                    fontSize="13px"
                    fontWeight="500"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={isActive ? '#d48c28' : 'rgba(245,239,230,0.55)'}
                    borderBottom="1px solid rgba(245,239,230,0.07)"
                    _hover={{ color: '#f5efe6', textDecoration: 'none' }}
                    transition="color 0.15s"
                  >
                    {link.label}
                  </ChakraLink>
                );
              })}
            </Stack>

            <Box mt={8}>
              {isAuthenticated ? (
                <Button
                  w="full"
                  variant="unstyled"
                  fontFamily="'DM Sans', sans-serif"
                  fontSize="12px"
                  fontWeight="500"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color="rgba(245,239,230,0.5)"
                  border="1px solid rgba(245,239,230,0.18)"
                  borderRadius="2px"
                  h="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  _hover={{ color: '#f5efe6', borderColor: 'rgba(245,239,230,0.35)' }}
                  transition="all 0.15s"
                  onClick={() => { logout(); onClose(); }}
                >
                  Logout
                </Button>
              ) : (
                <Stack spacing={3}>
                  <Button
                    as={Link}
                    href="/auth/login"
                    onClick={onClose}
                    w="full"
                    variant="unstyled"
                    fontFamily="'DM Sans', sans-serif"
                    fontSize="12px"
                    fontWeight="500"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="rgba(245,239,230,0.5)"
                    border="1px solid rgba(245,239,230,0.18)"
                    borderRadius="2px"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    _hover={{ color: '#f5efe6', borderColor: 'rgba(245,239,230,0.35)', textDecoration: 'none' }}
                    transition="all 0.15s"
                  >
                    Log in
                  </Button>
                  <Button
                    as={Link}
                    href="/auth/register"
                    onClick={onClose}
                    w="full"
                    variant="unstyled"
                    fontFamily="'DM Sans', sans-serif"
                    fontSize="12px"
                    fontWeight="500"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="#0a0908"
                    bg="#d48c28"
                    borderRadius="2px"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    _hover={{ bg: '#f5c842', textDecoration: 'none' }}
                    transition="background 0.15s"
                  >
                    Sign up
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}