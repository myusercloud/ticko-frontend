'use client';

import {
  Box,
  Flex,
  Button,
  Link as ChakraLink,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Stack,
  Spinner,
} from '@chakra-ui/react';
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

export function Navbar() {
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <Box
      as="header"
      bg="white"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex
        maxW="7xl"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={3}
        align="center"
        justify="space-between"
        gap={4}
      >
        <ChakraLink as={Link} href="/" fontWeight="bold" fontSize="xl" color="brand.600">
          Ticko
        </ChakraLink>

        <Stack
          direction="row"
          spacing={6}
          display={{ base: 'none', md: 'flex' }}
          align="center"
        >
          {navLinks.map((link) => (
            <ChakraLink
              key={link.href}
              as={Link}
              href={link.href}
              fontWeight={pathname === link.href ? 600 : 500}
              color={pathname === link.href ? 'brand.600' : 'gray.700'}
              _hover={{ color: 'brand.600' }}
            >
              {link.label}
            </ChakraLink>
          ))}
        </Stack>

        <Flex align="center" gap={3}>
          {isLoading ? (
            <Spinner size="sm" />
          ) : isAuthenticated ? (
            <>
              <Box
                display={{ base: 'none', sm: 'block' }}
                fontSize="sm"
                color="gray.600"
              >
                {user?.email}
              </Box>
              <Button
                size="sm"
                variant="outline"
                colorScheme="brand"
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
                variant="ghost"
                display={{ base: 'none', sm: 'inline-flex' }}
              >
                Log in
              </Button>
              <Button as={Link} href="/auth/register" size="sm" colorScheme="brand">
                Sign up
              </Button>
            </>
          )}

          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            display={{ base: 'flex', md: 'none' }}
            variant="ghost"
            onClick={onOpen}
          />
        </Flex>
      </Flex>

      <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody pt={4}>
            <Stack spacing={4}>
              {navLinks.map((link) => (
                <ChakraLink
                  key={link.href}
                  as={Link}
                  href={link.href}
                  onClick={onClose}
                  fontWeight={pathname === link.href ? 600 : 500}
                  color={pathname === link.href ? 'brand.600' : 'gray.700'}
                  py={2}
                >
                  {link.label}
                </ChakraLink>
              ))}
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  colorScheme="red"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button as={Link} href="/auth/login" onClick={onClose}>
                    Log in
                  </Button>
                  <Button
                    as={Link}
                    href="/auth/register"
                    colorScheme="brand"
                    onClick={onClose}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
