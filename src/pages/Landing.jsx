import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Search, Home, Users, Shield, ArrowRight, CheckCircle, Star, MapPin, GraduationCap, Sparkles, IndianRupee } from 'lucide-react';

const popularCities = ['Bengaluru', 'Chennai', 'Pune', 'Hyderabad', 'Coimbatore', 'Kochi'];

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient">
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-in">
                <GraduationCap className="w-4 h-4 text-warning fill-warning" />
                <span className="text-primary-foreground/90 text-sm font-medium">Trusted by 10,000+ students & freshers</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6 animate-slide-up leading-tight">
                Affordable PGs & Rooms
                <br />
                <span className="text-accent">For Students Like You</span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/85 mb-8 animate-slide-up max-w-2xl mx-auto" style={{ animationDelay: '0.1s' }}>
                Find budget-friendly PGs, shared rooms & compatible roommates near your college. 
                Starting from just <span className="font-bold text-accent">₹3,000/month</span> – no brokers, no hassle! 🎓
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Link to="/listings">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2 shadow-xl">
                    <Search className="w-5 h-5" />
                    Find a Room
                  </Button>
                </Link>
                <Link to="/auth?mode=signup&role=owner">
                  <Button variant="heroOutline" size="xl" className="w-full sm:w-auto gap-2">
                    <Home className="w-5 h-5" />
                    List Your Space
                  </Button>
                </Link>
                <Link to="/roommate-requests">
                  <Button variant="heroOutline" size="xl" className="w-full sm:w-auto gap-2">
                    <Users className="w-5 h-5" />
                    Find Roommates
                  </Button>
                </Link>
              </div>

              {/* Popular Cities */}
              <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <p className="text-primary-foreground/70 text-sm mb-3">Popular Cities</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularCities.map((city) => (
                    <Link 
                      key={city} 
                      to={`/listings?city=${city}`}
                      className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-primary-foreground/90 text-sm transition-all hover:scale-105"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {city}
                    </Link>
                  ))}
                </div>
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
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Your Perfect Stay in 3 Easy Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No brokers, no hassle. Just simple, direct connections between you and verified property owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-card rounded-2xl p-8 card-elevated h-full border border-border/50">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Search & Filter</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Browse verified PGs, flats, and rooms. Filter by budget, city, room type, and amenities that matter to you.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-card rounded-2xl p-8 card-elevated h-full border border-border/50">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Connect Securely</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Send contact requests to owners. Your details stay private until they approve – no spam, no strangers.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-card rounded-2xl p-8 card-elevated h-full border border-border/50">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Move In Happy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visit, verify, and move into your new home. Start your new chapter with confidence!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Indian Students & Professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: GraduationCap, title: 'Made for Students', desc: 'Budget-friendly options starting from ₹3,000/month' },
              { icon: Shield, title: 'Verified Listings', desc: 'Every PG is reviewed and verified by our team' },
              { icon: Users, title: 'Find Flatmates', desc: 'Connect with students who share your vibe' },
              { icon: Sparkles, title: 'Zero Brokerage', desc: 'No hidden fees – save money for what matters' },
            ].map((feature, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 card-elevated text-center border border-border/50">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Your Perfect PG is Waiting! 🏠
              </h2>
              <p className="text-primary-foreground/85 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of students and freshers who found affordable stays through CoLiviMates. Start your search today – it's 100% free!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/listings">
                  <Button variant="hero" size="xl" className="gap-2 shadow-xl">
                    Browse Rooms
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="heroOutline" size="xl" className="gap-2">
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
