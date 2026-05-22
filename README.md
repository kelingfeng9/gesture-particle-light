# Gesture Particle Light Field

一个基于摄像头单手势识别的粒子光感网页。页面使用 MediaPipe Hands 捕捉单手动作，并让粒子在不同手势下切换不同颜色、收缩状态和光效形态。

## 手势效果

- 张开：金色星尘向外铺开
- 握拳：青色光核向中心压缩
- 捏合：紫粉光核高速旋转
- 指向：玫红月牙光轨
- 挥动：蓝色拖尾穿过暗场
- V形：电蓝双螺旋光带
- 三指：金白三束放射
- 摇滚：红蓝锯齿闪电

## 本地运行

```bash
npm install
npm run dev
```

打开 Vite 输出的本地地址后，点击「启动摄像头」并允许浏览器摄像头权限。没有摄像头权限时，也可以用页面右下角的手势按钮预览效果。

## 验证

```bash
npm test
npm run build
```

## 技术栈

- Vite
- Canvas 2D 粒子渲染
- MediaPipe Hands
- Node test runner
