"use client";

import { useState, useEffect } from 'react';
import { Agent } from '@/lib/types';
import { AgentCard } from '@/components/AgentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1]);
  const [minRating, setMinRating] = useState(0);
  const [onlineOnly, setOnlineOnly] = useState(false);

  const categories = ['creative', 'blockchain', 'storage', 'data', 'marketing'];

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [agents, searchQuery, selectedCategories, priceRange, minRating, onlineOnly]);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        setAgents([]);
        return;
      }
      const data = await response.json();
      setAgents(data || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!agents || agents.length === 0) {
      setFilteredAgents([]);
      return;
    }

    let filtered = [...agents];

    if (searchQuery) {
      filtered = filtered.filter(
        (agent) => {
          const capabilities = Array.isArray(agent.capabilities) ? agent.capabilities : [];
          return (
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            capabilities.some((cap) =>
              cap.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        }
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((agent) =>
        selectedCategories.includes(agent.category)
      );
    }

    filtered = filtered.filter(
      (agent) =>
        agent.pricing.per_task >= priceRange[0] &&
        agent.pricing.per_task <= priceRange[1]
    );

    if (minRating > 0) {
      filtered = filtered.filter((agent) => agent.rating >= minRating);
    }

    if (onlineOnly) {
      filtered = filtered.filter((agent) => agent.status === 'online');
    }

    setFilteredAgents(filtered);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([0, 1]);
    setMinRating(0);
    setOnlineOnly(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 1 ||
    minRating > 0 ||
    onlineOnly;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Agent Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and hire autonomous agents for your workflows
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search agents by name or capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-20 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Category</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label
                      htmlFor={category}
                      className="text-sm capitalize cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Price Range</h4>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1}
                step={0.01}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>${priceRange[0].toFixed(2)}</span>
                <span>${priceRange[1].toFixed(2)}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Minimum Rating</h4>
              <div className="space-y-2">
                {[5, 4, 3, 0].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={minRating === rating}
                      onCheckedChange={() => setMinRating(rating)}
                    />
                    <label
                      htmlFor={`rating-${rating}`}
                      className="text-sm cursor-pointer"
                    >
                      {rating > 0 ? `${rating}+ stars` : 'All ratings'}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Status</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="online-only"
                  checked={onlineOnly}
                  onCheckedChange={(checked) => setOnlineOnly(checked as boolean)}
                />
                <label htmlFor="online-only" className="text-sm cursor-pointer">
                  Online only
                </label>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAgents.length} of {agents.length} agents
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <X className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No agents found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your filters
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>Clear filters</Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
