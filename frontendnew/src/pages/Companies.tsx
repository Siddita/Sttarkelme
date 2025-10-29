import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Building2,
  Users,
  Clock,
  Star,
  ArrowRight,
  Filter,
  MapPin,
  Briefcase
} from "lucide-react";
import { listCompaniesApiV1CompaniesGet } from "@/hooks/useApis";

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Technology", "Finance", "Healthcare", "Manufacturing", "Retail", "Education", "Other"];

  // Real company data from API
  const { data: companies, isLoading: companiesLoading, error: companiesError } = listCompaniesApiV1CompaniesGet();

  const filteredCompanies = (companies || []).filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || company.industry === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-500 border-green-500";
      case "Medium": return "text-yellow-500 border-yellow-500";
      case "Hard": return "text-red-500 border-red-500";
      default: return "text-primary border-primary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Company-Specific
              <span className="bg-gradient-primary bg-clip-text text-transparent block">
                Interview Prep
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice with real interview questions and processes from top companies. 
              Get insights into what each company looks for in candidates.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading and Error States */}
          {companiesLoading && (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">Loading companies...</div>
            </div>
          )}
          {companiesError && (
            <div className="text-center py-8">
              <div className="text-lg text-red-600">Error loading companies: {companiesError.message}</div>
            </div>
          )}

          {/* Companies Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group">
                {/* Company Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">🏢</div>
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {company.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{typeof company.hq_city === 'string' ? company.hq_city : 'N/A'}, {typeof company.hq_country === 'string' ? company.hq_country : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary">
                    {typeof company.industry === 'string' ? company.industry : 'N/A'}
                  </Badge>
                </div>

                {/* Company Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm">
                      <Building2 className="w-3 h-3 text-primary" />
                      <span className="font-medium">{typeof company.size_range === 'string' ? company.size_range : 'N/A'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Size</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm">
                      <Users className="w-3 h-3 text-primary" />
                      <span className="font-medium">{typeof company.founded_year === 'string' || typeof company.founded_year === 'number' ? company.founded_year : 'N/A'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Founded</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm">
                      <Briefcase className="w-3 h-3 text-primary" />
                      <span className="font-medium">{typeof company.domain === 'string' ? company.domain : 'N/A'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Domain</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {typeof company.description === 'string' ? company.description : JSON.stringify(company.description) || 'No description available'}
                </p>

                {/* Website Link */}
                {typeof company.website === 'string' && company.website && (
                  <div className="mb-6">
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center"
                    >
                      <span>Visit Website</span>
                      <ArrowRight className="ml-1 w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  variant="hero" 
                  className="w-full group-hover:shadow-glow-primary"
                >
                  Start {company.name} Prep
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No companies found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Companies;