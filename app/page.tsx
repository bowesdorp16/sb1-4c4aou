import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Dumbbell,
  Scale,
  Trophy,
  Target
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Noise overlay */}
      <div className="noise" />

      {/* Hero section */}
      <div className="flex-1 w-full py-24 md:py-32 xl:py-48 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full opacity-20"
            poster="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80"
          >
            <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-giant font-black tracking-tighter">
                BULK
                <span className="gradient-text">BLITZ</span>
              </h1>
              
              <div className="flex flex-col items-center space-y-2">
                <p className="text-2xl md:text-4xl font-black tracking-tight text-muted-foreground">
                  TRACK • ANALYZE • GROW
                </p>
                <p className="text-lg md:text-xl text-muted-foreground/80 max-w-lg">
                  Your all-in-one platform for tracking nutrition, maximizing gains, and achieving your muscle-building goals
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="outline" className="hover-lift">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover-lift">
                <Link href="/auth/signup">Start Building Muscle</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="w-full py-24 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group hover-lift">
              <div className="flex flex-col items-center text-center space-y-4">
                <Scale className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-black">Track Progress</h3>
                <p className="text-muted-foreground">
                  Monitor your caloric surplus and protein intake for optimal muscle growth
                </p>
              </div>
            </div>
            
            <div className="group hover-lift">
              <div className="flex flex-col items-center text-center space-y-4">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-black">Set Goals</h3>
                <p className="text-muted-foreground">
                  Get personalized bulking strategies based on your body type and goals
                </p>
              </div>
            </div>
            
            <div className="group hover-lift">
              <div className="flex flex-col items-center text-center space-y-4">
                <Trophy className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-black">Achieve Results</h3>
                <p className="text-muted-foreground">
                  Monitor your gains with advanced metrics and progress tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}