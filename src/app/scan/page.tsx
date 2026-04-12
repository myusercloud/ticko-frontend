'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  VStack,
  Spinner,
} from '@chakra-ui/react';
import { Html5Qrcode } from 'html5-qrcode';
import { useScanTicket } from '@/hooks/useTickets';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { ScanResult } from '@/lib/types';

type ScanTicketDetails = {
  event?: { name?: string };
  ticketType?: { name?: string };
  status?: string;
};

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    message: string;
    ticket?: ScanTicketDetails;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);

  const toast = useToast();
  const scanTicket = useScanTicket();

  const stopScanner = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setIsScanning(false);
      return;
    }

    try {
      await scanner.stop();
    } catch {
      // Ignore stop failures when scanner is already stopped.
    }

    try {
      await scanner.clear();
    } catch {
      // Ignore clear failures.
    }

    scannerRef.current = null;
    setIsScanning(false);
  };

  const handleScan = async (qrPayload: string) => {
    try {
      const ticketId = qrPayload.trim();
      const res = await scanTicket.mutateAsync({
        ticketId,
        qrPayload: ticketId,
      });

      const data = res.data as ScanResult;

      setScanResult({
        valid: data.valid,
        message: data.message ?? (data.valid ? 'Ticket valid' : 'Invalid ticket'),
        ticket: data.ticket
          ? {
              event: { name: data.ticket.event?.name },
              ticketType: { name: data.ticket.ticketType?.name },
              status: data.ticket.status,
            }
          : undefined,
      });

      toast({
        title: data.valid ? 'Ticket valid' : 'Invalid ticket',
        status: data.valid ? 'success' : 'warning',
      });
    } catch (err) {
      setScanResult({
        valid: false,
        message: (err as Error).message ?? 'Scan failed',
      });

      toast({
        title: 'Scan failed',
        description: (err as Error).message,
        status: 'error',
      });
    }
  };

  const startScanner = async () => {
    if (isStartingRef.current) return;

    isStartingRef.current = true;
    setScanResult(null);
    setCameraError(null);

    await stopScanner();

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopScanner();
          await handleScan(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err) {
      setCameraError((err as Error).message || 'Could not access camera');
      toast({
        title: 'Camera error',
        description: (err as Error).message,
        status: 'error',
      });
      scannerRef.current = null;
      setIsScanning(false);
    } finally {
      isStartingRef.current = false;
    }
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  return (
    <ProtectedRoute>
      <Container maxW="lg" py={8} px={4}>
        <Heading size="lg" mb={2}>
          Scan ticket
        </Heading>
        <Text color="gray.600" mb={6}>
          Point your camera at the ticket QR code
        </Text>

        <Card bg="white">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box
                id="qr-reader"
                w="100%"
                minH="280px"
                borderRadius="md"
                overflow="hidden"
                bg="black"
              />

              {cameraError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Camera unavailable</AlertTitle>
                    <AlertDescription>{cameraError}</AlertDescription>
                  </Box>
                </Alert>
              )}

              {!isScanning ? (
                <Button
                  colorScheme="brand"
                  onClick={startScanner}
                  width="full"
                  isLoading={isStartingRef.current}
                  loadingText="Starting camera..."
                >
                  Start camera
                </Button>
              ) : (
                <Button variant="outline" onClick={() => void stopScanner()} width="full">
                  Stop scanning
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>

        {scanTicket.isPending && (
          <Alert status="info" borderRadius="md" mt={4}>
            <Spinner size="sm" mr={2} />
            Verifying ticket...
          </Alert>
        )}

        {scanResult && !scanTicket.isPending && (
          <Alert
            status={scanResult.valid ? 'success' : 'error'}
            borderRadius="md"
            mt={4}
            flexDirection="column"
            alignItems="flex-start"
          >
            <AlertIcon />
            <AlertTitle>{scanResult.valid ? 'Valid ticket' : 'Invalid ticket'}</AlertTitle>
            <AlertDescription>
              {scanResult.message}
              {scanResult.ticket?.event?.name && (
                <Text mt={2}>
                  Event: {scanResult.ticket.event.name}
                  {scanResult.ticket.ticketType?.name
                    ? ` · ${scanResult.ticket.ticketType.name}`
                    : ''}
                </Text>
              )}
            </AlertDescription>
          </Alert>
        )}
      </Container>
    </ProtectedRoute>
  );
}
