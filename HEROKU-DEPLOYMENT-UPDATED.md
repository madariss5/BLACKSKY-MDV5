# BLACKSKY-MD Premium Heroku Deployment Guide

This comprehensive guide will help you deploy the BLACKSKY-MD Premium WhatsApp bot to Heroku with persistent session storage, database support, and 24/7 operation.

## ⚠️ Important Requirements

1. A **Heroku account** (sign up at [heroku.com](https://heroku.com))
2. We strongly recommend using a **paid Heroku plan** (at least "Eco") for stable 24/7 operation
3. PostgreSQL database add-on (automatically configured with deployments using this guide)

## 🚀 Quick Deploy Method (Recommended)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/blackskytech/BLACKSKY-MD)

1. Click the "Deploy to Heroku" button above.
2. Fill in the required environment variables:
   - `SESSION_ID`: A unique identifier for your WhatsApp session (any name you choose)
   - `BOT_NAME`: The name of your WhatsApp bot (default: BLACKSKY-MD)
   - `OWNER_NUMBER`: Your WhatsApp number with country code (e.g., 491556315347)
   - `PREFIX`: Command prefix for the bot (default: .)
   - `HEROKU_APP_URL`: Your app URL (e.g., https://your-app-name.herokuapp.com)
3. Click "Deploy App" and wait for the deployment to finish.
4. Once deployed, go to the Heroku dashboard and add the PostgreSQL database:
   ```bash
   heroku addons:create heroku-postgresql:mini -a your-app-name
   ```
5. Restart your app after adding PostgreSQL:
   ```bash
   heroku restart -a your-app-name
   ```

## 🛠️ Manual Deployment with Git

1. Fork this repository to your GitHub account.
2. Clone your forked repository:
   ```bash
   git clone https://github.com/your-username/BLACKSKY-MD.git
   cd BLACKSKY-MD
   ```
3. Log in to Heroku:
   ```bash
   heroku login
   ```
4. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
5. Add PostgreSQL database:
   ```bash
   heroku addons:create heroku-postgresql:mini -a your-app-name
   ```
6. Set the required environment variables:
   ```bash
   heroku config:set SESSION_ID=your_session_id
   heroku config:set BOT_NAME=BLACKSKY-MD
   heroku config:set OWNER_NUMBER=your_number_with_country_code
   heroku config:set PREFIX=.
   heroku config:set HEROKU_APP_URL=https://your-app-name.herokuapp.com
   ```
7. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

## 📋 Configuration Options

### Essential Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_ID` | Unique identifier for your WhatsApp session | (required) |
| `BOT_NAME` | Name of your WhatsApp bot | BLACKSKY-MD |
| `OWNER_NUMBER` | Your WhatsApp number with country code | (required) |
| `PREFIX` | Command prefix for the bot | . |
| `HEROKU_APP_URL` | Your app URL for anti-idle functionality | (optional) |

### Additional Configuration (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `LANGUAGE` | Bot's default language (en, de, id, es) | en |
| `ENABLE_RPG` | Enable or disable RPG features | true |
| `MAX_FILESIZE` | Maximum file size for uploads (in MB) | 100 |
| `GROUP_ONLY` | Restrict bot to group chats only | false |
| `DATABASE_URL` | PostgreSQL connection URL (set automatically) | (auto) |

## 📱 Connecting Your WhatsApp

After deployment, follow these steps to connect your WhatsApp account:

1. Wait for the deployment to complete and check the logs:
   ```bash
   heroku logs --tail -a your-app-name
   ```

2. When the QR code appears in the logs, scan it with your WhatsApp by:
   - Open WhatsApp on your phone
   - Tap Menu (three dots) > Linked Devices > Link a Device
   - Scan the QR code displayed in the Heroku logs

3. Once connected, the bot will display a success message and is ready to use!

## 🔍 Troubleshooting Guide

### Common Issues

1. **PostgreSQL Connection Error**
   - Verify the PostgreSQL add-on is installed: `heroku addons -a your-app-name`
   - Check if DATABASE_URL is set: `heroku config -a your-app-name`
   - Solution: Add PostgreSQL if missing: `heroku addons:create heroku-postgresql:mini -a your-app-name`

2. **QR Code Not Appearing**
   - Check logs for errors: `heroku logs --tail -a your-app-name`
   - Solution: Restart the app: `heroku restart -a your-app-name`

3. **Session Disconnections**
   - Verify you're using a paid plan (free dynos sleep after 30 minutes of inactivity)
   - Check if HEROKU_APP_URL is set correctly to prevent dyno sleeping
   - Solution: Upgrade to at least Eco plan for 24/7 operation

4. **Memory Issues**
   - Check for memory errors in logs: `heroku logs --tail -a your-app-name | grep "memory"`
   - Solution: Scale dyno to higher specs: `heroku dyno:resize basic -a your-app-name`

5. **Port Conflicts (EADDRINUSE Errors)**
   - This is now automatically handled by the latest version
   - The app will automatically select alternative ports if conflicts occur

## 🌟 Advanced Configuration for Best Performance

For optimal performance and stability, we recommend:

1. **Upgrade to Paid Dyno**: Use at least the "Eco" ($5/month) plan to avoid dyno sleeping and maintain 24/7 operation.

2. **Database Backups**: Enable automated backups for your PostgreSQL database:
   ```bash
   heroku pg:backups:schedule DATABASE_URL --at '02:00 UTC' -a your-app-name
   ```

3. **Custom Domain**: Add a custom domain to your Heroku app for a professional appearance:
   ```bash
   heroku domains:add example.com -a your-app-name
   ```

4. **Monitoring**: Add free Heroku metrics for better monitoring:
   ```bash
   heroku labs:enable runtime-metrics -a your-app-name
   ```

## 📊 Maintenance & Monitoring

1. **Checking Logs**: View real-time logs to monitor bot activity:
   ```bash
   heroku logs --tail -a your-app-name
   ```

2. **Restarting the Bot**: If you encounter issues, try restarting:
   ```bash
   heroku restart -a your-app-name
   ```

3. **Update Bot**: To update to the latest version:
   ```bash
   git pull
   git push heroku main
   ```

4. **Resource Usage**: Monitor your app's resource usage in the Heroku dashboard.

5. **Database Management**: Check database status:
   ```bash
   heroku pg:info -a your-app-name
   ```

## ⚠️ Important Notes for 24/7 Operation

1. **Free Tier Limitations**: Free dynos sleep after 30 minutes of inactivity and are limited to 550 hours per month, making them unsuitable for 24/7 operation.

2. **Eco Tier ($5/month)**: Provides always-on operation and is the minimum recommended tier for reliable bot operation.

3. **Database Persistence**: The PostgreSQL add-on ensures your bot data and sessions persist across dyno restarts and deployments.

4. **Multiple Devices**: BLACKSKY-MD supports multi-device operation, so you can use WhatsApp on your phone while the bot is running.

5. **Automatic Recovery**: The bot includes mechanisms to automatically recover from crashes and connection issues.

## Need Help?

If you encounter any issues during deployment or operation, join our support group on WhatsApp for assistance:
[BLACKSKY-MD Support Group](https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q)

Happy Botting! 🤖✨
