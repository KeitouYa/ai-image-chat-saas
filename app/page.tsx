import { GenerateImageInput } from "@/components/forms/generate-image-input";
import { HeroImageSlider } from "@/components/image/hero-image-slider";

export default function Home() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      {/* Text + Input - left aligned, compact */}
      <div className="flex flex-col space-y-3 pb-6">
        <h1 className="text-8xl lg:text-9xl font-bold leading-none">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            AI
          </span>
          <br />
          Image
          <br />
          Generator
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Harness the power of advanced AI to transform text into beautiful
          images. Support for multiple artistic styles, integrated intelligent
          chat assistant for creative guidance and prompt optimization. Simply
          input your ideas and let AI create unique artwork just for you.
        </p>
        <GenerateImageInput />
      </div>

      {/* Slider - scroll to see */}
      <div className="pb-8">
        <HeroImageSlider />
      </div>
    </div>
  );
}
