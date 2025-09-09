# Webhook

This document describes the webhook functionality in the What Now app.

## Who

The webhook is designed for you if you want to integrate your task progress with external services.

## What

What what ?

## When

The webhook will be triggered whenever there is a change in the tasks progress.

## Where

The webhook will send the POST request to the URL you specify in the settings.

## How

A POST request will be sent to the HTTP endpoint you declare in settings, for example :

```text
POST https://my-domain.com/endpoint
```

This POST will have this payload:

```json
{
  "nextTask": "Get some coffee beans",
  "progress": 50,
  "remaining": 15
}
```

- `nextTask` : the title of the next task to be completed today
- `progress` : the percentage of the whole progress of the day
- `remaining` : the estimated time in minutes remaining to complete the day

Some server side implementation samples :

- [PHP](https://github.com/Shuunen/monorepo/blob/master/apps/one-file/olivo-hue-status.php)

## Why

Can't you just relax and let it go ?
