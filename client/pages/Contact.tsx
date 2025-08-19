import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  ArrowLeft,
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleInputChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Camera className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Tiktok Image Library
                </h1>
              </div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Gallery
            </Link>
            <Link
              to="/contact"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/admin"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about uploading images, need help with the approval
              process, or want to suggest improvements? We'd love to hear from
              you.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Send us a Message</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We'll get back to you within
                        24 hours.
                      </p>
                      <Button
                        onClick={() => setSubmitted(false)}
                        variant="outline"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange("name")}
                            placeholder="Your full name"
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange("email")}
                            placeholder="your.email@example.com"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={handleInputChange("subject")}
                          placeholder="What's this about?"
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={handleInputChange("message")}
                          placeholder="Tell us more about your inquiry..."
                          rows={6}
                          required
                          className="mt-1"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-muted-foreground">
                        hello@tiktoklibrary.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Address</p>
                      <p className="text-muted-foreground">
                        123 Creative Street
                        <br />
                        Design District
                        <br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Monday - Friday
                      </span>
                      <span className="text-foreground">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="text-foreground">
                        10:00 AM - 4:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="text-foreground">Closed</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Response time: Within 24 hours
                  </p>
                </CardContent>
              </Card>

              {/* FAQ Link */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Looking for quick answers? Check out our FAQ section for
                    common questions about uploading, approval process, and
                    more.
                  </p>
                  <Button variant="outline" className="w-full">
                    View FAQ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <Card className="bg-muted/30">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Join Our Community
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Follow us on social media for the latest updates, featured
                  images, and community highlights from PixelVault.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" size="sm">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm">
                    Instagram
                  </Button>
                  <Button variant="outline" size="sm">
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
