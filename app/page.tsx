import { Button } from "@/components/ui/button";
import { GenerateImageInput } from "@/components/forms/generate-image-input";
import { HeroImageSlider } from "@/components/display/hero-image-slider";

export default function Home() {
  return (
    <div className="flex items-center justify-center m-5">
      {/* 
        flex: 使用 Flexbox 布局
        items-center: 垂直居中
        justify-center: 水平居中
        m-5: 外边距 5（Tailwind CSS 的间距单位）
      */}
      <div className="grid max-w-4xl">
        <div className="my-10">
          <h1 className="text-7xl lg:text-9xl font-bold mb-2">
            <span className="text-8xl bg-gradient-to-l from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text animate-pulse">
              {/* 
                bg-gradient-to-l: 渐变从左到右
                from-blue-500: 从蓝色开始
                via-purple-500: 经过紫色
                to-red-500: 到红色
                text-transparent: 文字透明（让背景渐变显示出来）
                bg-clip-text: 背景裁剪到文字
                animate-pulse: 脉冲动画（闪烁效果）
              */}
              AI
            </span>
            <br />
            Image Generator
          </h1>
          <p>
            Harness the power of advanced AI to transform text into beautiful
            images. Support for multiple artistic styles, integrated intelligent
            chat assistant for creative guidance and prompt optimization. Simply
            input your ideas and let AI create unique artwork just for you.
          </p>
        </div>
        <GenerateImageInput />
        <div className="relative">
          <HeroImageSlider />
        </div>
      </div>
    </div>
  );
}
