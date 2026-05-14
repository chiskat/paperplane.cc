-- 根据 better-auth 的 apikey 插件升级指南，手动同步数据列
UPDATE apikey SET reference_id = user_id WHERE reference_id IS NULL;
