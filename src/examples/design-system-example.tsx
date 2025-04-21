import React from "react";
import { Button, dsButtonPrimary, dsButtonOutline } from "../features/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, dsCard } from "../features/ui/card";
import { Input } from "../features/ui/input";
import { Textarea } from "../features/ui/textarea";

/**
 * Example implementation of the design system components
 * This demonstrates how to use the updated components following the style guide
 */
export default function DesignSystemExample() {
  return (
    <div className="container py-8">
      <h1 className="ds-section-title">Design System Example</h1>
      <div className="ds-accent-bar"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Main content */}
        <div className="md:col-span-8">
          <section className="mb-8">
            <h2 className="ds-section-subtitle">Cards</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Standard Card */}
              <Card className={dsCard}>
                <CardHeader>
                  <CardTitle>Standard Card</CardTitle>
                  <CardDescription>This uses the design system card styling</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-foreground">
                    This card demonstrates the standard design system styling with rounded-xs corners,
                    border-2, and shadow-xs elevation.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className={dsButtonPrimary}>Primary Action</Button>
                </CardFooter>
              </Card>
              
              {/* Featured Card */}
              <Card className={`${dsCard} border-primary`}>
                <CardHeader>
                  <CardTitle>Featured Card</CardTitle>
                  <CardDescription>With primary border accent</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-foreground">
                    This card has a primary border to highlight it as a featured element.
                    It follows the design system pattern for emphasized cards.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className={dsButtonOutline}>Secondary Action</Button>
                </CardFooter>
              </Card>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="ds-section-subtitle">Buttons</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-card border-2 border-border rounded-xs shadow-xs">
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-bold mb-2">Primary</h3>
                <Button>Primary Button</Button>
                <Button size="sm">Small Button</Button>
                <Button size="lg">Large Button</Button>
                <Button disabled>Disabled</Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-bold mb-2">Secondary</h3>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link" uppercase={false}>Link</Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-bold mb-2">Semantic</h3>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="secondary" uppercase={false}>No Uppercase</Button>
              </div>
            </div>
          </section>
        </div>
        
        {/* Sidebar */}
        <div className="md:col-span-4">
          <Card className={dsCard}>
            <CardHeader>
              <CardTitle>Form Example</CardTitle>
              <CardDescription>Mobile-optimized form elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  showError={true}
                />
                <p className="text-xs text-destructive">Please enter a valid email address</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea id="message" placeholder="Enter your message" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
              <Button className="w-full sm:w-auto">Submit</Button>
            </CardFooter>
          </Card>
          
          <div className="mt-6 p-4 border-2 border-border border-dashed rounded-xs">
            <h3 className="font-bold mb-2">Mobile Examples</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These components are optimized for mobile with proper spacing 
              and touch targets.
            </p>
            <Button mobileFullWidth={true} size="lg">
              Mobile Full Width
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 