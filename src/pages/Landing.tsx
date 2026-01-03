import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Search, Home, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react';

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-slide-up">
                Find Affordable Rooms & Roommates Near You
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Discover verified co-living spaces and connect with compatible roommates. 
                Your perfect home is just a few clicks away.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Link to="/listings">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                    <Search className="w-5 h-5" />
                    Find a Room
                  </Button>
                </Link>
                <Link to="/auth?mode=signup&role=owner">
                  <Button variant="heroOutline" size="xl" className="w-full sm:w-auto gap-2">
                    <Home className="w-5 h-5" />
                    Post a Room
                  </Button>
                </Link>
                <Link to="/roommate-requests">
                  <Button variant="heroOutline" size="xl" className="w-full sm:w-auto gap-2">
                    <Users className="w-5 h-5" />
                    Find a Roommate
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Wave Decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
            </svg>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Finding your perfect co-living space is easy with CoLiving. Just follow these simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-card rounded-2xl p-8 card-elevated h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Search & Explore</h3>
                <p className="text-muted-foreground">
                  Browse through verified listings with filters for budget, location, and room type.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-card rounded-2xl p-8 card-elevated h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Connect Safely</h3>
                <p className="text-muted-foreground">
                  Send contact requests to owners. Your info stays private until they approve.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-card rounded-2xl p-8 card-elevated h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Home className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Move In</h3>
                <p className="text-muted-foreground">
                  Finalize details with your new landlord or roommate and move into your new space!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose CoLiving?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Verified Listings', desc: 'All listings are reviewed by our team' },
              { icon: Users, title: 'Roommate Matching', desc: 'Find compatible people to share with' },
              { icon: CheckCircle, title: 'Secure Contact', desc: 'Your details stay private' },
              { icon: Home, title: 'All Room Types', desc: 'Single, double, triple & more' },
            ].map((feature, i) => (
              <div key={i} className="bg-card rounded-xl p-6 card-elevated text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Find Your Perfect Space?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of people who have found their ideal co-living arrangement through CoLiving.
            </p>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
