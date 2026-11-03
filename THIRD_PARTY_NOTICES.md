# 第三方组件说明

- Tesseract.js 7.0.0：Apache License 2.0。许可证副本见 `vendor/TESSERACT_JS_LICENSE.txt`。
- Tesseract.js Core 6.0.0：Apache License 2.0。许可证副本见 `vendor/TESSERACT_CORE_LICENSE.txt`。
- 简体中文 OCR 模型 `chi_sim`：来自 Tesseract `tessdata_fast` 4.0.0 兼容模型集，遵循 Apache License 2.0。项目地址：https://github.com/tesseract-ocr/tessdata_fast
- 英文 OCR 模型 `eng`：来自 Tesseract `tessdata_fast` 4.1.0 兼容模型集，遵循 Apache License 2.0。项目地址：https://github.com/tesseract-ocr/tessdata_fast

组件版本固定并随康伴本地打包，运行时不调用第三方 OCR 云服务。
