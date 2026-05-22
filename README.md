# Full Body Particle Light Stage

一个基于摄像头全身动作识别的粒子光感网页。页面使用 MediaPipe Tasks Vision 捕捉全身姿态和双手关键点，并让粒子绑定到头、双手、躯干、腿和脚等身体部位。

## MVP 动作效果

- 举手：双臂光柱上冲
- 拍手：中心光核爆开
- 挥臂：手臂拖出霓虹光带
- 抬腿：地面刀光划过
- 跳跃：落地点环形冲击
- 转身：躯干旋涡拉开
- 跳舞：全身高能粒子联动

## 摄像头要求

- 使用 HTTPS 或本地 Vite 地址，浏览器才会允许摄像头权限。
- 人需要后退一点，让摄像头看到头、双手、躯干和腿。
- 光线太暗、腿部出画面或身体被遮挡时，动作识别会降级到演示/待机效果。

## 本地运行

```bash
npm install
npm run dev
```

打开 Vite 输出的本地地址后，点击「启动全身识别」并允许浏览器摄像头权限。没有摄像头权限时，也可以用页面右下角的动作按钮预览效果。

## 验证

```bash
npm test
npm run build
```

## 技术栈

- Vite
- Canvas 2D 粒子渲染
- MediaPipe Tasks Vision
- Node test runner
