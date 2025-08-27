import React, { useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Download, Settings, Sparkles, QrCode } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AdvancedOptions from './AdvancedOptions';

const QRCodeGenerator = () => {
  const [qrValue, setQRValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [textBelow, setTextBelow] = useState('');
  const [logo, setLogo] = useState('');
  const [showLogo, setShowLogo] = useState(false);
  const [resolution, setResolution] = useState(1000);
  const qrCodeRef = useRef(null);
  const previewSize = 240; // Larger preview size

  const generateQRCode = () => {
    if (!inputValue.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setQRValue(inputValue);
      setIsGenerating(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      generateQRCode();
    }
  };

  const generateQRCodeImage = useCallback(() => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = resolution;
      canvas.height = resolution + (textBelow ? resolution * 0.15 : 0); // Add space for text
      const ctx = canvas.getContext('2d');
      
      // Fill background with white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR Code
      const qrSize = resolution * 0.8; // 80% of the resolution
      const qrPosition = (resolution - qrSize) / 2;
      const svgString = new XMLSerializer().serializeToString(qrCodeRef.current.querySelector('svg'));
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, qrPosition, qrPosition, qrSize, qrSize);
        
        // Draw text below
        if (textBelow) {
          const fontSize = resolution * 0.04;
          ctx.font = `600 ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = '#1f2937';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const textY = qrPosition + qrSize + (resolution * 0.04); // 4% padding below QR code
          ctx.fillText(textBelow, resolution / 2, textY);
        }
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
    });
  }, [resolution, textBelow]);

  const copyToClipboard = async () => {
    try {
      const dataUrl = await generateQRCodeImage();
      const blob = await fetch(dataUrl).then(res => res.blob());
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      toast.success("QR Code copied to clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy QR Code");
    }
  };

  const saveAsPNG = async () => {
    try {
      const dataUrl = await generateQRCodeImage();
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = dataUrl;
      link.click();
      toast.success("QR Code saved as PNG!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save QR Code");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="shadow-medium border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-primary/10 p-4 rounded-full">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            QR Code Alchemist
          </CardTitle>
          <p className="text-muted-foreground mt-2 font-medium">
            Transform your content into beautiful QR codes
          </p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8 space-y-8">
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your text, URL, or message..."
                className="text-lg py-6 pr-12 border-2 border-muted focus:border-primary transition-all duration-300 bg-background/50"
              />
              <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            
            <Button 
              onClick={generateQRCode} 
              className="w-full py-6 text-lg font-semibold gradient-primary hover:shadow-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isGenerating || !inputValue.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Magic...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-5 w-5" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="advanced-options" className="border border-muted rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center text-foreground">
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="font-medium">Advanced Options</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <AdvancedOptions
                  text={textBelow}
                  setText={setTextBelow}
                  logo={logo}
                  setLogo={setLogo}
                  showLogo={showLogo}
                  setShowLogo={setShowLogo}
                  resolution={resolution}
                  setResolution={setResolution}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {qrValue && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <div 
                  ref={qrCodeRef} 
                  className="p-6 bg-background rounded-2xl shadow-soft border border-muted/50 transition-all duration-300 hover:shadow-medium animate-float"
                  style={{ width: `${previewSize + 48}px` }}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <QRCodeSVG 
                      value={qrValue} 
                      size={previewSize}
                      level="H"
                      className="rounded-lg"
                      imageSettings={showLogo && logo ? {
                        src: logo,
                        x: undefined,
                        y: undefined,
                        height: Math.round(previewSize * 0.16),
                        width: Math.round(previewSize * 0.16),
                        excavate: true,
                      } : undefined}
                    />
                    {textBelow && (
                      <div className="text-center text-sm font-semibold text-foreground/80 px-2">
                        {textBelow}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={copyToClipboard} 
                  variant="outline"
                  className="flex items-center gap-2 px-6 py-3 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button 
                  onClick={saveAsPNG} 
                  variant="outline"
                  className="flex items-center gap-2 px-6 py-3 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;