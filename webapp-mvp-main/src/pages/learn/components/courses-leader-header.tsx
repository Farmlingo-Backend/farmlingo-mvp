import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPath: string;
  setSelectedPath: (path: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function Header({
  activeTab,
  setActiveTab,
  selectedPath,
  setSelectedPath,
  sortBy,
  setSortBy,
}: HeaderProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        <div className="bg-gray-50 rounded-full p-1 flex items-center">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-6 py-2 focus:ring-0 focus:ring-offset-0 ${
              activeTab === "all"
                ? "bg-white text-black shadow-sm hover:bg-white" 
                : "text-gray-600 hover:bg-transparent hover:text-gray-600" 
            }`}
          >
            All Courses
          </Button>
          <Button
            variant={activeTab === "progress" ? "default" : "ghost"}
            onClick={() => setActiveTab("progress")}
            className={`rounded-full px-6 py-2 focus:ring-0 focus:ring-offset-0 ${
              activeTab === "progress"
                ? "bg-white text-black shadow-sm hover:bg-white"
                : "text-gray-600 hover:bg-transparent hover:text-gray-600" 
            }`}
          >
            In Progress
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPath} onValueChange={setSelectedPath}>
            <SelectTrigger className="w-40 border-gray-300">
              <SelectValue placeholder="Learning path" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Paths</SelectItem>
              <SelectItem value="organic">Organic Agriculture</SelectItem>
              <SelectItem value="livestock">Livestock Management</SelectItem>
              <SelectItem value="sustainable">Sustainable Farming</SelectItem>
              <SelectItem value="technology">Agricultural Technology</SelectItem>
              <SelectItem value="crop">Crop Science</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}